import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  fetchJogatinaPlayerSlimRows,
  fetchRecentJogatinas,
} from "@/lib/fetch-landing-data";
import { LandingTimelineSection } from "@/components/landing-timeline-section";

export async function LandingTimelineSectionAsync(): Promise<ReactElement> {
  const supabase = await createClient();

  const [recentJogatinas, slimRows] = await Promise.all([
    fetchRecentJogatinas(supabase, 8),
    fetchJogatinaPlayerSlimRows(supabase),
  ]);

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
    player: row.player!,
  }));

  return (
    <LandingTimelineSection
      jogatinas={recentJogatinas}
      jogatinaPlayers={jogatinaPlayers}
    />
  );
}
