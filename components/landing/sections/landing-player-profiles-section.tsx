import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchPlayerAggregateStatsMap } from "@/lib/fetch-all-jogatina-players";
import {
  buildLandingPlayerStatsList,
  fetchJogatinaPlayerSlimRows,
  fetchLandingPlayers,
  fetchSeasonParticipantsSlim,
} from "@/lib/fetch-landing-data";
import { LandingPlayerProfiles } from "@/components/landing-player-profiles/index";

export async function LandingPlayerProfilesSection(): Promise<ReactElement> {
  const supabase = await createClient();

  const [players, statsMap, slimRows, seasonParticipants] = await Promise.all([
    fetchLandingPlayers(supabase),
    fetchPlayerAggregateStatsMap(supabase),
    fetchJogatinaPlayerSlimRows(supabase),
    fetchSeasonParticipantsSlim(supabase),
  ]);

  const playerStats = buildLandingPlayerStatsList(
    players,
    statsMap,
    slimRows,
    seasonParticipants,
  );

  return <LandingPlayerProfiles playerStats={playerStats} />;
}
