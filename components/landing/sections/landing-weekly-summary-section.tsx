import type { ReactElement } from "react"
import { LandingWeeklySummary } from "@/components/landing/landing-weekly-summary"
import { fetchLandingWeeklySummary } from "@/lib/fetch-landing-data"
import { createClient } from "@/lib/supabase/server"

export async function LandingWeeklySummarySection(): Promise<ReactElement> {
  const supabase = await createClient()
  const summary = await fetchLandingWeeklySummary(supabase)

  return <LandingWeeklySummary summary={summary} />
}
