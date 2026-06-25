import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchJogatinaPlayerSlimRows } from "@/lib/fetch-landing-data";
import { LandingGroupMetrics } from "@/components/landing-group-metrics/index";

export async function LandingGroupMetricsSection(): Promise<ReactElement> {
  const supabase = await createClient();
  const slimRows = await fetchJogatinaPlayerSlimRows(supabase);

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
  }));

  return (
    <LandingGroupMetrics
      jogatinaPlayers={jogatinaPlayers}
      seasonParticipants={[]}
    />
  );
}
