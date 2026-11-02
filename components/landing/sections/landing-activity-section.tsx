import type { ReactElement } from "react"
import { createClient } from "@/lib/supabase/server"
import { fetchJogatinasForHeatmap } from "@/lib/fetch-landing-data"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { ActivitySummaryCards } from "@/components/activity-summary-cards"
import { ChristmasFrame } from "@/components/landing/christmas-frame"
import type { Game, Jogatina } from "@/lib/types"

export async function LandingActivitySection(): Promise<ReactElement> {
  const supabase = await createClient()
  const jogatinas = await fetchJogatinasForHeatmap(supabase)

  const heatmapJogatinas = jogatinas as (Jogatina & { game: Game })[]
  const heatmapSessions = jogatinas.map(({ date, first_event_at, last_event_at, total_duration_minutes }) => ({
    date, first_event_at, last_event_at, total_duration_minutes,
  }))

  return (
    <ChristmasFrame className="homepage-activity-frame">
      <div className="homepage-activity-content">
        <ActivitySummaryCards
          jogatinas={heatmapJogatinas}
          variant="inline"
          className="homepage-activity-summary"
        />

        <ActivityHeatmap jogatinas={heatmapSessions} />
      </div>
    </ChristmasFrame>
  )
}
