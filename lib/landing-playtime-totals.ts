import type { createClient } from "@/lib/supabase/server";
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers";
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const PAGE_SIZE = 1000;

export interface PlaytimeDurationTotals {
  gameMinutes: number;
  appMinutes: number;
  sessionCount: number;
}

export type PlaytimeJogatinaRow = {
  total_duration_minutes: number | null;
  game: { is_app: boolean } | null;
};

export function accumulateFinishedPlaytimeRow(
  totals: PlaytimeDurationTotals,
  row: PlaytimeJogatinaRow,
): "missing_game" | "counted" {
  if (!row.game) {
    return "missing_game";
  }

  totals.sessionCount += 1;

  const minutes = Math.max(0, row.total_duration_minutes ?? 0);

  if (row.game.is_app) {
    totals.appMinutes += minutes;
  } else {
    totals.gameMinutes += minutes;
  }

  return "counted";
}

export function playtimeMinutesMatch(
  left: PlaytimeDurationTotals,
  right: PlaytimeDurationTotals,
): boolean {
  return (
    left.gameMinutes === right.gameMinutes &&
    left.appMinutes === right.appMinutes
  );
}

export function playtimeTotalsMatch(
  left: PlaytimeDurationTotals,
  right: PlaytimeDurationTotals,
): boolean {
  return (
    playtimeMinutesMatch(left, right) &&
    left.sessionCount === right.sessionCount
  );
}

export async function fetchPlaytimeDurationTotals(
  supabase: SupabaseClient,
): Promise<PlaytimeDurationTotals> {
  const totals: PlaytimeDurationTotals = {
    gameMinutes: 0,
    appMinutes: 0,
    sessionCount: 0,
  };

  const seenIds = new Set<string>();
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("jogatinas")
      .select("id, total_duration_minutes, game:games!inner(is_app)")
      .eq("is_current", false)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    if (!rows.length) {
      break;
    }

    for (const row of rows) {
      if (seenIds.has(row.id)) {
        continue;
      }

      seenIds.add(row.id);

      const game = normalizeSupabaseRelation(row.game);
      accumulateFinishedPlaytimeRow(totals, {
        total_duration_minutes: row.total_duration_minutes,
        game,
      });
    }

    if (rows.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return totals;
}

export function playtimeTotalsToHours(totals: PlaytimeDurationTotals): {
  gameHours: number;
  appHours: number;
  totalHours: number;
} {
  const gameHours = Math.floor(totals.gameMinutes / 60);
  const appHours = Math.floor(totals.appMinutes / 60);

  return {
    gameHours,
    appHours,
    totalHours: gameHours + appHours,
  };
}
