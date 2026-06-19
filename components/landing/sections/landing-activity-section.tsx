import { createClient } from "@/lib/supabase/server";
import { fetchJogatinasForHeatmap } from "@/lib/fetch-landing-data";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { ActivitySummaryCards } from "@/components/activity-summary-cards";
import type { Game, Jogatina } from "@/lib/types";

export async function LandingActivitySection() {
  const supabase = await createClient();
  const jogatinas = await fetchJogatinasForHeatmap(supabase);

  const heatmapJogatinas = jogatinas as (Jogatina & { game: Game })[];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
      <ActivityHeatmap jogatinas={heatmapJogatinas} />
      <ActivitySummaryCards jogatinas={heatmapJogatinas} />
    </div>
  );
}
