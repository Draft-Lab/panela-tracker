import type { ReactElement } from "react"
import { createClient } from "@/lib/supabase/server"
import { fetchJogatinasForHeatmap } from "@/lib/fetch-landing-data"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { ActivitySummaryCards } from "@/components/activity-summary-cards"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import type { Game, Jogatina } from "@/lib/types"

export async function LandingActivitySection(): Promise<ReactElement> {
  const supabase = await createClient()
  const jogatinas = await fetchJogatinasForHeatmap(supabase)

  const heatmapJogatinas = jogatinas as (Jogatina & { game: Game })[]
  const heatmapSessions = jogatinas.map(({ date, first_event_at, last_event_at, total_duration_minutes }) => ({
    date, first_event_at, last_event_at, total_duration_minutes,
  }))

  return (
    <LandingGlassCell innerClassName="overflow-visible p-3 sm:p-4 lg:p-5">
      <div className="flex flex-col gap-4 lg:gap-5">
        <ActivitySummaryCards
          jogatinas={heatmapJogatinas}
          variant="inline"
          className="homepage-activity-summary"
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
          <div className="min-w-0 flex-1">
            <ActivityHeatmap jogatinas={heatmapSessions} />
          </div>
        </div>
      </div>
    </LandingGlassCell>
  )
}
