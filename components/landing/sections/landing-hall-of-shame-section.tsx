import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  fetchJogatinaPlayerSlimRows,
  fetchSeasonParticipantsSlim,
  slimRowsToJogatinaPlayers,
} from "@/lib/fetch-landing-data";
import { HallOfShame } from "@/components/hall-of-shame";

export async function LandingHallOfShameSection(): Promise<ReactElement> {
  const supabase = await createClient();

  const [slimRows, seasonParticipants] = await Promise.all([
    fetchJogatinaPlayerSlimRows(supabase),
    fetchSeasonParticipantsSlim(supabase),
  ]);

  return (
    <HallOfShame
      jogatinaPlayers={slimRowsToJogatinaPlayers(slimRows)}
      seasonParticipants={seasonParticipants}
    />
  );
}
