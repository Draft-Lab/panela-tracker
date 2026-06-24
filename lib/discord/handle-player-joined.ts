import { countActivePlayers } from "./jogatina-metrics";

type SupabaseClient = {
  from: (table: string) => unknown;
};

export type HandlePlayerJoinedSuccess = {
  success: true;
  message: string;
  jogatina_id: string;
  game_title: string;
  active_players: number;
  session_type: "solo" | "group";
  season_id: string | null;
};

export type HandlePlayerJoinedError = {
  success: false;
  error: string;
  status: number;
};

export type HandlePlayerJoinedResult =
  | HandlePlayerJoinedSuccess
  | HandlePlayerJoinedError;

async function associateToActiveSeason(
  supabase: SupabaseClient,
  jogatinaId: string,
  gameId: string,
) {
  try {
    const now = new Date().toISOString();

    const { data: activeSeason } = await (supabase as JoinSupabaseClient)
      .from("seasons")
      .select("id")
      .eq("game_id", gameId)
      .eq("is_active", true)
      .lte("started_at", now)
      .or(`ended_at.is.null,ended_at.gte.${now}`)
      .single();

    if (activeSeason) {
      await (supabase as JoinSupabaseClient)
        .from("jogatinas")
        .update({ season_id: activeSeason.id })
        .eq("id", jogatinaId);

      return activeSeason.id;
    }

    return null;
  } catch {
    return null;
  }
}

type JoinSupabaseClient = Parameters<typeof countActivePlayers>[0];

export async function handlePlayerJoined(
  supabase: JoinSupabaseClient,
  playerId: string,
  gameId: string,
  gameTitle: string,
  timestamp: string,
): Promise<HandlePlayerJoinedResult> {
  const { data: activeJogatina } = await supabase
    .from("jogatinas")
    .select("*")
    .eq("game_id", gameId)
    .eq("is_current", true)
    .eq("source", "discord_bot")
    .single();

  let jogatina = activeJogatina;

  if (!jogatina) {
    const { data: newJogatina, error } = await supabase
      .from("jogatinas")
      .insert({
        game_id: gameId,
        date: timestamp,
        is_current: true,
        source: "discord_bot",
        session_type: "solo",
        active_players: 0,
        first_event_at: timestamp,
        notes: "Sessão iniciada automaticamente via Discord Bot",
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to create jogatina: ${error.message}`,
        status: 500,
      };
    }
    jogatina = newJogatina;

    await associateToActiveSeason(supabase, jogatina.id, gameId);
  }

  const { data: existingPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", jogatina.id)
    .eq("player_id", playerId)
    .single();

  if (existingPlayer?.is_active) {
    const activeCount = await countActivePlayers(supabase, jogatina.id);
    const sessionType = activeCount > 1 ? "group" : "solo";

    await supabase
      .from("jogatinas")
      .update({
        active_players: activeCount,
        session_type: sessionType,
        last_event_at: timestamp,
      })
      .eq("id", jogatina.id);

    return {
      success: true,
      message: "Player already active in jogatina",
      jogatina_id: jogatina.id,
      game_title: gameTitle,
      active_players: activeCount,
      session_type: sessionType,
      season_id: jogatina.season_id || null,
    };
  }

  if (!existingPlayer) {
    const { error: playerError } = await supabase.from("jogatina_players").insert({
      jogatina_id: jogatina.id,
      player_id: playerId,
      status: "Jogatina",
      is_active: true,
    });

    if (playerError) {
      return {
        success: false,
        error: `Failed to add player to jogatina: ${playerError.message}`,
        status: 500,
      };
    }
  } else {
    const { error: activateError } = await supabase
      .from("jogatina_players")
      .update({ is_active: true })
      .eq("id", existingPlayer.id);

    if (activateError) {
      return {
        success: false,
        error: `Failed to reactivate player: ${activateError.message}`,
        status: 500,
      };
    }
  }

  const { error: eventError } = await supabase.from("jogatina_events").insert({
    jogatina_id: jogatina.id,
    player_id: playerId,
    event_type: "player_joined",
    timestamp,
  });

  if (eventError) {
    return {
      success: false,
      error: `Failed to register event: ${eventError.message}`,
      status: 500,
    };
  }

  const activeCount = await countActivePlayers(supabase, jogatina.id);
  const sessionType = activeCount > 1 ? "group" : "solo";

  const { error: updateError } = await supabase
    .from("jogatinas")
    .update({
      active_players: activeCount,
      session_type: sessionType,
      last_event_at: timestamp,
    })
    .eq("id", jogatina.id);

  if (updateError) {
    return {
      success: false,
      error: `Failed to update jogatina: ${updateError.message}`,
      status: 500,
    };
  }

  return {
    success: true,
    message: "Player joined event registered",
    jogatina_id: jogatina.id,
    game_title: gameTitle,
    active_players: activeCount,
    session_type: sessionType,
    season_id: jogatina.season_id || null,
  };
}
