import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchLandingHeroData } from "@/lib/fetch-landing-data";
import { LandingHero } from "@/components/landing-hero";

export async function LandingHeroSection(): Promise<ReactElement> {
  const supabase = await createClient();
  const heroData = await fetchLandingHeroData(supabase);

  return <LandingHero {...heroData} />;
}
