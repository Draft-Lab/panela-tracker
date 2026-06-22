"use server";

import { revalidatePath } from "next/cache";
import { finishJogatina } from "@/lib/discord/jogatina-metrics";
import {
  buildJogatinaIssues,
  minutesSinceTimestamp,
} from "@/lib/live-state-audit";
import { isAdmin } from "@/lib/supabase/auth-helpers";
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers";
import { createClient } from "@/lib/supabase/server";

export interface LiveStateFixResult {
  success: boolean;
  error?: string;
  deactivatedPlayers?: number;
  finalizedSessions?: number;
}

async function requireAdmin() {
  const admin = await isAdmin();

  if (!admin) {
    return {
      ok: false as const,
      result: {
        success: false,
        error: "Sem permissão de administrador.",
      },
    };
  }

  return { ok: true as const };
}

export async function deactivateOrphanedPlayersAction(): Promise<LiveStateFixResult> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.result;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jogatina_players")
    .select("id, jogatina_id, jogatina:jogatinas(is_current)")
    .eq("is_active", true);

  if (error) {
    return { success: false, error: error.message };
  }

  const orphanedRows = (data ?? []).filter((row) => {
    const jogatina = normalizeSupabaseRelation(row.jogatina);
    return jogatina && !jogatina.is_current;
  });

  if (!orphanedRows.length) {
    return { success: true, deactivatedPlayers: 0 };
  }

  const orphanedIds = orphanedRows.map((row) => row.id);
  const jogatinaIds = [...new Set(orphanedRows.map((row) => row.jogatina_id))];

  const { error: updateError } = await supabase
    .from("jogatina_players")
    .update({ is_active: false })
    .in("id", orphanedIds);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  for (const jogatinaId of jogatinaIds) {
    await supabase
      .from("jogatinas")
      .update({ active_players: 0 })
      .eq("id", jogatinaId)
      .eq("is_current", false);
  }

  revalidatePath("/dashboard/auditoria-horas");
  revalidatePath("/dashboard/jogos-atuais");

  return {
    success: true,
    deactivatedPlayers: orphanedIds.length,
  };
}

export async function finalizeStuckSessionsAction(): Promise<LiveStateFixResult> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.result;
  }

  const supabase = await createClient();
  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from("jogatinas")
    .select(
      `
      id,
      first_event_at,
      last_event_at,
      date,
      season_id,
      active_players,
      jogatina_players(id, is_active)
    `,
    )
    .eq("is_current", true);

  if (error) {
    return { success: false, error: error.message };
  }

  let finalizedSessions = 0;

  for (const row of data ?? []) {
    const players = row.jogatina_players ?? [];
    const activePlayersCount = players.filter((player) => player.is_active).length;
    const lastEventAt = row.last_event_at ?? row.first_event_at ?? row.date;
    const issues = buildJogatinaIssues({
      activePlayersCount,
      recordedActivePlayers: row.active_players,
      minutesSinceLastEvent: minutesSinceTimestamp(lastEventAt),
    });

    const shouldFinalize = issues.some(
      (issue) =>
        issue.type === "empty_current_session" ||
        issue.type === "stale_session",
    );

    if (!shouldFinalize) {
      continue;
    }

    await supabase
      .from("jogatina_players")
      .update({ is_active: false })
      .eq("jogatina_id", row.id)
      .eq("is_active", true);

    await finishJogatina(
      supabase,
      {
        id: row.id,
        first_event_at: row.first_event_at,
        season_id: row.season_id,
      },
      timestamp,
    );

    finalizedSessions += 1;
  }

  revalidatePath("/dashboard/auditoria-horas");
  revalidatePath("/dashboard/jogos-atuais");

  return {
    success: true,
    finalizedSessions,
  };
}
