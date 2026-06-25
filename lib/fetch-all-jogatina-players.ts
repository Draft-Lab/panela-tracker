import type { createClient } from "@/lib/supabase/server";
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers";
import type { JogatinaPlayerWithDetails } from "@/lib/player-profile-helpers";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const PAGE_SIZE = 1000;

export async function fetchAllJogatinaPlayers(
  supabase: SupabaseClient,
): Promise<JogatinaPlayerWithDetails[]> {
  const allRows: JogatinaPlayerWithDetails[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("jogatina_players")
      .select(
        `
        *,
        player:players(*),
        jogatina:jogatinas(*, game:games(*))
      `,
      )
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (!data?.length) {
      break;
    }

    allRows.push(...(data as JogatinaPlayerWithDetails[]));

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allRows;
}

export interface PlayerAggregateStats {
  totalMinutes: number;
  totalSessions: number;
}

export async function fetchPlayerAggregateStatsMap(
  supabase: SupabaseClient,
): Promise<Map<string, PlayerAggregateStats>> {
  const statsMap = new Map<string, PlayerAggregateStats>();
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("jogatina_players")
      .select(
        `
        player_id,
        total_duration_minutes,
        jogatina:jogatinas(game:games(is_app))
      `,
      )
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (!data?.length) {
      break;
    }

    for (const row of data) {
      const jogatina = normalizeSupabaseRelation(row.jogatina);
      const game = jogatina
        ? normalizeSupabaseRelation(jogatina.game)
        : null;
      if (game?.is_app) {
        continue;
      }

      const current = statsMap.get(row.player_id) ?? {
        totalMinutes: 0,
        totalSessions: 0,
      };

      current.totalMinutes += row.total_duration_minutes || 0;
      current.totalSessions += 1;
      statsMap.set(row.player_id, current);
    }

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return statsMap;
}
