import { unstable_cache } from "next/cache";
import type { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

type SupabaseClient =
  | Awaited<ReturnType<typeof createClient>>
  | ReturnType<typeof createPublicClient>;

export interface PlaytimeDurationTotals {
  gameMinutes: number;
  appMinutes: number;
  sessionCount: number;
}

export type PlaytimeJogatinaRow = {
  total_duration_minutes: number | null;
  game: { is_app: boolean } | null;
};

type PlaytimeTotalsRpcRow = {
  game_minutes: number;
  app_minutes: number;
  session_count: number;
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

function parseRpcTotals(
  row: PlaytimeTotalsRpcRow | undefined,
): PlaytimeDurationTotals {
  return {
    gameMinutes: Number(row?.game_minutes ?? 0),
    appMinutes: Number(row?.app_minutes ?? 0),
    sessionCount: Number(row?.session_count ?? 0),
  };
}

async function fetchPlaytimeDurationTotalsFromRpc(
  supabase: SupabaseClient,
): Promise<PlaytimeDurationTotals> {
  const { data, error } = await supabase.rpc("get_finished_playtime_totals");

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return parseRpcTotals(row as PlaytimeTotalsRpcRow | undefined);
}

export async function fetchPlaytimeDurationTotals(
  supabase: SupabaseClient,
): Promise<PlaytimeDurationTotals> {
  return fetchPlaytimeDurationTotalsFromRpc(supabase);
}

export const getCachedPlaytimeDurationTotals = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    return fetchPlaytimeDurationTotalsFromRpc(supabase);
  },
  ["landing-playtime-duration-totals"],
  { revalidate: 300 },
);

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
