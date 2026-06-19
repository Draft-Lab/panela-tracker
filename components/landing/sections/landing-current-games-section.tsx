import { createClient } from "@/lib/supabase/server";
import { fetchCurrentJogatinas } from "@/lib/fetch-landing-data";
import { LandingCurrentGamesSection } from "@/components/landing-current-games-section";

export async function LandingCurrentGamesSectionAsync() {
  const supabase = await createClient();
  const currentGames = await fetchCurrentJogatinas(supabase);

  return (
    <LandingCurrentGamesSection
      currentGames={currentGames}
      isInteractive={false}
    />
  );
}
