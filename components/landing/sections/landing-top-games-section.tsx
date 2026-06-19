import { createClient } from "@/lib/supabase/server";
import { fetchJogatinasForRanking } from "@/lib/fetch-landing-data";
import { LandingTopGames } from "@/components/landing-top-games";

export async function LandingTopGamesSection() {
  const supabase = await createClient();
  const jogatinas = await fetchJogatinasForRanking(supabase);

  return (
    <LandingTopGames
      jogatinas={jogatinas}
      jogatinaPlayers={jogatinas.flatMap(
        (j) =>
          j.jogatina_players?.map((jp) => ({
            ...jp,
            jogatina_id: j.id,
          })) ?? [],
      )}
    />
  );
}
