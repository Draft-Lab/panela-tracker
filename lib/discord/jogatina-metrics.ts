import type { createClient } from "../supabase/server";
import type { JogatinaEvent } from "../types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function countActivePlayers(
  supabase: SupabaseClient,
  jogatinaId: string,
) {
  const { data } = await supabase
    .from("jogatina_players")
    .select("id")
    .eq("jogatina_id", jogatinaId)
    .eq("is_active", true);

  return data?.length || 0;
}

export async function updateJogatinaCounters(
  supabase: SupabaseClient,
  jogatinaId: string,
  timestamp: string,
) {
  const activeCount = await countActivePlayers(supabase, jogatinaId);
  const sessionType = activeCount > 1 ? "group" : "solo";

  await supabase
    .from("jogatinas")
    .update({
      active_players: activeCount,
      session_type: sessionType,
      last_event_at: timestamp,
    })
    .eq("id", jogatinaId);

  return { activeCount, sessionType };
}

export async function calculatePlayerDurations(
  supabase: SupabaseClient,
  jogatinaId: string,
) {
  const { data: events, error: eventsError } = await supabase
    .from("jogatina_events")
    .select("*")
    .eq("jogatina_id", jogatinaId)
    .order("timestamp", { ascending: true });

  if (eventsError || !events || events.length === 0) {
    console.error("[calculatePlayerDurations] Error fetching events:", eventsError);
    return;
  }

  const { data: jogatinaPlayers, error: playersError } = await supabase
    .from("jogatina_players")
    .select("id, player_id")
    .eq("jogatina_id", jogatinaId);

  if (playersError || !jogatinaPlayers) {
    console.error("[calculatePlayerDurations] Error fetching players:", playersError);
    return;
  }

  for (const jp of jogatinaPlayers) {
    const playerId = jp.player_id;
    const playerEvents = events.filter(
      (e: JogatinaEvent) => e.player_id === playerId,
    );

    if (playerEvents.length === 0) continue;

    let totalTime = 0;
    let soloTime = 0;
    let groupTime = 0;

    for (let i = 0; i < playerEvents.length; i++) {
      const event = playerEvents[i];

      if (event.event_type === "player_joined") {
        const joinTime = new Date(event.timestamp);
        const nextLeaveEvent = playerEvents
          .slice(i + 1)
          .find((e: JogatinaEvent) => e.event_type === "player_left");

        if (nextLeaveEvent) {
          const leaveTime = new Date(nextLeaveEvent.timestamp);
          const sessionDuration =
            (leaveTime.getTime() - joinTime.getTime()) / 60000;

          totalTime += sessionDuration;

          const otherActivePlayers = events.filter((e: JogatinaEvent) => {
            if (e.player_id === playerId) return false;

            const eventTime = new Date(e.timestamp);

            if (e.event_type === "player_joined" && eventTime <= leaveTime) {
              const otherLeaveEvent = events.find(
                (le: JogatinaEvent) =>
                  le.player_id === e.player_id &&
                  le.event_type === "player_left" &&
                  new Date(le.timestamp) >= joinTime,
              );

              return (
                !otherLeaveEvent ||
                new Date(otherLeaveEvent.timestamp) > joinTime
              );
            }

            return false;
          });

          if (otherActivePlayers.length > 0) {
            groupTime += sessionDuration;
          } else {
            soloTime += sessionDuration;
          }
        }
      }
    }

    await supabase
      .from("jogatina_players")
      .update({
        solo_duration_minutes: Math.round(soloTime),
        group_duration_minutes: Math.round(groupTime),
        total_duration_minutes: Math.round(totalTime),
      })
      .eq("id", jp.id);
  }
}

export async function updateSeasonMetrics(
  supabase: SupabaseClient,
  seasonId: string,
  jogatinaId: string,
) {
  try {
    const { data: jogatinaPlayers } = await supabase
      .from("jogatina_players")
      .select(
        "player_id, total_duration_minutes, solo_duration_minutes, group_duration_minutes",
      )
      .eq("jogatina_id", jogatinaId);

    if (!jogatinaPlayers || jogatinaPlayers.length === 0) return;

    for (const jp of jogatinaPlayers) {
      const { data: participant } = await supabase
        .from("season_participants")
        .select("*")
        .eq("season_id", seasonId)
        .eq("player_id", jp.player_id)
        .single();

      if (participant) {
        await supabase
          .from("season_participants")
          .update({
            total_sessions: participant.total_sessions + 1,
            total_duration_minutes:
              participant.total_duration_minutes +
              (jp.total_duration_minutes || 0),
            solo_duration_minutes:
              participant.solo_duration_minutes +
              (jp.solo_duration_minutes || 0),
            group_duration_minutes:
              participant.group_duration_minutes +
              (jp.group_duration_minutes || 0),
          })
          .eq("id", participant.id);
      } else {
        await supabase.from("season_participants").insert({
          season_id: seasonId,
          player_id: jp.player_id,
          status: "Em andamento",
          total_sessions: 1,
          total_duration_minutes: jp.total_duration_minutes || 0,
          solo_duration_minutes: jp.solo_duration_minutes || 0,
          group_duration_minutes: jp.group_duration_minutes || 0,
        });
      }
    }
  } catch (error) {
    console.error("[Discord] Erro ao atualizar métricas da temporada:", error);
  }
}

export async function finishJogatina(
  supabase: SupabaseClient,
  jogatina: {
    id: string;
    first_event_at: string | null;
    season_id: string | null;
  },
  timestamp: string,
) {
  await calculatePlayerDurations(supabase, jogatina.id);

  const firstEvent = jogatina.first_event_at
    ? new Date(jogatina.first_event_at)
    : new Date(timestamp);
  const lastEvent = new Date(timestamp);
  const durationMinutes = Math.floor(
    (lastEvent.getTime() - firstEvent.getTime()) / 60000,
  );

  await supabase
    .from("jogatinas")
    .update({
      is_current: false,
      active_players: 0,
      last_event_at: timestamp,
      total_duration_minutes: durationMinutes,
    })
    .eq("id", jogatina.id);

  if (jogatina.season_id) {
    await updateSeasonMetrics(supabase, jogatina.season_id, jogatina.id);
  }

  return durationMinutes;
}
