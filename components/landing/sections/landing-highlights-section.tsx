import { createClient } from "@/lib/supabase/server";
import {
  fetchJogatinasForRanking,
  fetchJogatinaPlayerSlimRows,
  fetchSeasonParticipantsSlim,
} from "@/lib/fetch-landing-data";
import { LandingHighlights } from "@/components/landing-highlights";
import type { Game } from "@/lib/types";

export async function LandingHighlightsSection() {
  const supabase = await createClient();

  const [jogatinas, slimRows, seasonParticipants] = await Promise.all([
    fetchJogatinasForRanking(supabase),
    fetchJogatinaPlayerSlimRows(supabase),
    fetchSeasonParticipantsSlim(supabase),
  ]);

  const gameByJogatinaId = new Map<string, Game>(
    jogatinas.map((jogatina) => [jogatina.id, jogatina.game]),
  );

  const jogatinaPlayers = slimRows.map((row) => ({
    id: row.id,
    jogatina_id: row.jogatina_id,
    player_id: row.player_id,
    status: row.status,
    notes: null,
    is_active: false,
    solo_duration_minutes: 0,
    group_duration_minutes: 0,
    total_duration_minutes: row.total_duration_minutes,
    created_at: row.created_at,
    player: row.player,
    jogatina: row.jogatina
      ? {
          season_id: row.jogatina.season_id,
          game_id: row.jogatina.game_id,
          game: gameByJogatinaId.get(row.jogatina_id) ?? undefined,
        }
      : undefined,
  }));

  return (
    <LandingHighlights
      jogatinas={jogatinas}
      jogatinaPlayers={
        jogatinaPlayers as Parameters<typeof LandingHighlights>[0]["jogatinaPlayers"]
      }
      seasonParticipants={
        seasonParticipants as Parameters<typeof LandingHighlights>[0]["seasonParticipants"]
      }
    />
  );
}
