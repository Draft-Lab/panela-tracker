import {
  calculatePlayerDurations,
  countActivePlayers,
  finishJogatina,
} from "./jogatina-metrics";
import { findActiveDiscordJogatina } from "./get-or-create-active-jogatina";

type LeftSupabaseClient = Parameters<typeof countActivePlayers>[0];

export type HandlePlayerLeftSuccess = {
  success: true;
  message: string;
  jogatina_id: string | null;
  game_title: string;
  active_players: number;
  session_type?: "solo" | "group";
  session_finished: boolean;
  total_duration_minutes?: number;
  season_id: string | null;
};

export type HandlePlayerLeftError = {
  success: false;
  error: string;
  status: number;
};

export type HandlePlayerLeftResult =
  | HandlePlayerLeftSuccess
  | HandlePlayerLeftError;

export async function handlePlayerLeft(
  supabase: LeftSupabaseClient,
  playerId: string,
  gameId: string,
  gameTitle: string,
  timestamp: string,
): Promise<HandlePlayerLeftResult> {
  const activeJogatina = await findActiveDiscordJogatina(supabase, gameId);

  if (!activeJogatina) {
    return {
      success: true,
      message: "No active jogatina found for this game",
      jogatina_id: null,
      game_title: gameTitle,
      active_players: 0,
      session_finished: false,
      season_id: null,
    };
  }

  const { data: jogatinaPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", activeJogatina.id)
    .eq("player_id", playerId)
    .maybeSingle();

  if (!jogatinaPlayer) {
    return {
      success: true,
      message: "Player is not in this jogatina",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: await countActivePlayers(supabase, activeJogatina.id),
      session_finished: false,
      season_id: (activeJogatina.season_id as string | null) || null,
    };
  }

  if (!jogatinaPlayer.is_active) {
    return {
      success: true,
      message: "Player is not currently active in this jogatina",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: await countActivePlayers(supabase, activeJogatina.id),
      session_finished: false,
      season_id: (activeJogatina.season_id as string | null) || null,
    };
  }

  const { error: deactivateError } = await supabase
    .from("jogatina_players")
    .update({ is_active: false })
    .eq("id", jogatinaPlayer.id);

  if (deactivateError) {
    return {
      success: false,
      error: `Failed to deactivate player: ${deactivateError.message}`,
      status: 500,
    };
  }

  const { error: eventError } = await supabase.from("jogatina_events").insert({
    jogatina_id: activeJogatina.id,
    player_id: playerId,
    event_type: "player_left",
    timestamp,
  });

  if (eventError) {
    return {
      success: false,
      error: `Failed to register event: ${eventError.message}`,
      status: 500,
    };
  }

  await calculatePlayerDurations(supabase, activeJogatina.id);

  const activePlayerCount = await countActivePlayers(
    supabase,
    activeJogatina.id,
  );

  if (activePlayerCount === 0) {
    let durationMinutes: number;
    try {
      durationMinutes = await finishJogatina(supabase, activeJogatina, timestamp);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to finish jogatina";
      return { success: false, error: message, status: 500 };
    }

    return {
      success: true,
      message: "Player left and jogatina finished automatically",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: 0,
      session_finished: true,
      total_duration_minutes: durationMinutes,
      season_id: (activeJogatina.season_id as string | null) || null,
    };
  }

  const newSessionType = activePlayerCount > 1 ? "group" : "solo";

  const { error: updateError } = await supabase
    .from("jogatinas")
    .update({
      active_players: activePlayerCount,
      session_type: newSessionType,
      last_event_at: timestamp,
    })
    .eq("id", activeJogatina.id);

  if (updateError) {
    return {
      success: false,
      error: `Failed to update jogatina: ${updateError.message}`,
      status: 500,
    };
  }

  return {
    success: true,
    message: "Player left event registered",
    jogatina_id: activeJogatina.id,
    game_title: gameTitle,
    active_players: activePlayerCount,
    session_type: newSessionType,
    session_finished: false,
    season_id: (activeJogatina.season_id as string | null) || null,
  };
}
