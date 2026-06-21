import type { createClient } from "@/lib/supabase/server";
import type { PlayerAggregateStats } from "@/lib/fetch-all-jogatina-players";
import { buildLandingPlayerCardStatsFromSummary } from "@/lib/player-profile-helpers";
import {
  fetchPlaytimeDurationTotals,
  playtimeTotalsToHours,
} from "@/lib/landing-playtime-totals";
import type {
  Game,
  Jogatina,
  JogatinaEvent,
  JogatinaPlayer,
  Player,
  SeasonParticipant,
} from "@/lib/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const PAGE_SIZE = 1000;

export type LandingCurrentJogatina = Jogatina & {
  game: Game;
  jogatina_players?: (JogatinaPlayer & { player: Player })[];
  jogatina_events?: Pick<JogatinaEvent, "player_id" | "event_type" | "timestamp">[];
};

export type LandingHeatmapJogatina = Jogatina & {
  game: Pick<Game, "id" | "is_app">;
};

export type LandingRankingJogatina = Jogatina & {
  game: Game;
  jogatina_players?: Pick<JogatinaPlayer, "player_id">[];
};

export type LandingSlimJogatinaPlayer = Pick<
  JogatinaPlayer,
  "id" | "player_id" | "status" | "total_duration_minutes" | "jogatina_id" | "created_at"
> & {
  player?: Player;
  jogatina?: {
    season_id: string | null;
    game_id: string;
    game: Pick<Game, "id" | "is_app"> | null;
  };
};

export type LandingSeasonParticipant = SeasonParticipant & {
  player?: Player;
  season?: { game_id: string; game: Game | null };
};

export interface LandingHeroData {
  playersCount: number;
  currentGamesCount: number;
  totalHours: number;
  appHours: number;
  mostPlayedThisWeek: string;
}

async function paginate<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const page = await fetchPage(from, from + PAGE_SIZE - 1);
    if (!page.length) {
      break;
    }
    all.push(...page);
    if (page.length < PAGE_SIZE) {
      break;
    }
    from += PAGE_SIZE;
  }

  return all;
}

export async function fetchLandingPlayers(
  supabase: SupabaseClient,
): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchCurrentJogatinas(
  supabase: SupabaseClient,
): Promise<LandingCurrentJogatina[]> {
  const { data, error } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(*, player:players(*)),
      jogatina_events(player_id, event_type, timestamp)
    `,
    )
    .eq("is_current", true)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (j) => j.game && !j.game.is_app,
  ) as LandingCurrentJogatina[];
}

export async function fetchLandingHeroData(
  supabase: SupabaseClient,
): Promise<LandingHeroData> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString();

  const [players, currentGames, weekJogatinas, durationTotals] = await Promise.all([
    fetchLandingPlayers(supabase),
    fetchCurrentJogatinas(supabase),
    supabase
      .from("jogatinas")
      .select("total_duration_minutes, date, game:games(id, title, is_app)")
      .gte("date", weekAgoIso)
      .then(({ data }) =>
        (data ?? []).filter((j) => j.game && !j.game.is_app),
      ),
    fetchPlaytimeDurationTotals(supabase),
  ]);

  const gameMinutes = weekJogatinas.reduce(
    (acc, jogatina) => {
      const game = jogatina.game;
      if (!game) {
        return acc;
      }
      acc[game.id] =
        (acc[game.id] || 0) + (jogatina.total_duration_minutes || 0);
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostPlayedGameId = Object.entries(gameMinutes)
    .filter(([, minutes]) => minutes > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const mostPlayedThisWeek = mostPlayedGameId
    ? weekJogatinas.find((j) => j.game?.id === mostPlayedGameId)?.game?.title ||
      "Nenhum"
    : "Nenhum";

  const playtimeHours = playtimeTotalsToHours(durationTotals);
  const totalHours = playtimeHours.gameHours + playtimeHours.appHours;

  return {
    playersCount: players.length,
    currentGamesCount: currentGames.length,
    totalHours,
    appHours: playtimeHours.appHours,
    mostPlayedThisWeek,
  };
}

export async function fetchRecentJogatinas(
  supabase: SupabaseClient,
  limit = 8,
): Promise<LandingCurrentJogatina[]> {
  const { data, error } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(*, player:players(*))
    `,
    )
    .order("last_event_at", { ascending: false, nullsFirst: false })
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (j) => j.game && !j.game.is_app,
  ) as LandingCurrentJogatina[];
}

export async function fetchJogatinasForHeatmap(
  supabase: SupabaseClient,
): Promise<LandingHeatmapJogatina[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  startDate.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("jogatinas")
    .select(
      `
      id,
      game_id,
      date,
      first_event_at,
      last_event_at,
      total_duration_minutes,
      game:games(id, is_app)
    `,
    )
    .gte("date", startDate.toISOString())
    .order("date", { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (j) => j.game && !j.game.is_app,
  ) as LandingHeatmapJogatina[];
}

export async function fetchJogatinaPlayerSlimRows(
  supabase: SupabaseClient,
): Promise<LandingSlimJogatinaPlayer[]> {
  const rows = await paginate(async (from, to) => {
    const { data, error } = await supabase
      .from("jogatina_players")
      .select(
        `
        id,
        player_id,
        status,
        total_duration_minutes,
        jogatina_id,
        created_at,
        player:players(*),
        jogatina:jogatinas(season_id, game_id, game:games(id, is_app))
      `,
      )
      .range(from, to);

    if (error) {
      throw error;
    }

    return data ?? [];
  });

  return rows.filter(
    (row) => row.jogatina?.game && !row.jogatina.game.is_app,
  ) as LandingSlimJogatinaPlayer[];
}

export async function fetchJogatinasForRanking(
  supabase: SupabaseClient,
): Promise<LandingRankingJogatina[]> {
  const rows = await paginate(async (from, to) => {
    const { data, error } = await supabase
      .from("jogatinas")
      .select(
        `
        id,
        game_id,
        date,
        notes,
        is_current,
        session_type,
        first_event_at,
        last_event_at,
        total_duration_minutes,
        active_players,
        source,
        season_id,
        created_at,
        game:games(id, title, cover_url, is_app, created_at, igdb_id, summary, storyline, first_release_date, genres, platforms, developers, themes, game_modes, rating, igdb_url, screenshots, igdb_synced_at),
        jogatina_players(player_id)
      `,
      )
      .order("date", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    return data ?? [];
  });

  return rows.filter(
    (j) => j.game && !j.game.is_app,
  ) as LandingRankingJogatina[];
}

export async function fetchSeasonParticipantsSlim(
  supabase: SupabaseClient,
): Promise<LandingSeasonParticipant[]> {
  const { data, error } = await supabase.from("season_participants").select(`
      *,
      player:players(*),
      season:seasons(game_id, game:games(*))
    `);

  if (error) {
    throw error;
  }

  return (data ?? []).filter(
    (sp) => sp.season?.game && !sp.season.game.is_app,
  ) as LandingSeasonParticipant[];
}

export function slimRowsToJogatinaPlayers(
  rows: LandingSlimJogatinaPlayer[],
): (JogatinaPlayer & {
  player: Player;
  jogatina?: { season_id: string | null };
})[] {
  return rows
    .filter(
      (row): row is LandingSlimJogatinaPlayer & { player: Player } =>
        Boolean(row.player),
    )
    .map((row) => ({
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
    player: row.player,
    jogatina: row.jogatina
      ? { season_id: row.jogatina.season_id }
      : undefined,
  }));
}

export function buildLandingPlayerStatsList(
  players: Player[],
  statsMap: Map<string, PlayerAggregateStats>,
  slimRows: LandingSlimJogatinaPlayer[],
  seasonParticipants: LandingSeasonParticipant[],
) {
  return players.map((player) => {
    const stats = statsMap.get(player.id) ?? {
      totalMinutes: 0,
      totalSessions: 0,
    };
    const rows = slimRows.filter((row) => row.player_id === player.id);
    const seasons = seasonParticipants.filter(
      (sp) => sp.player_id === player.id,
    );

    const drops =
      rows.filter((row) => !row.jogatina?.season_id && row.status === "Dropo")
        .length +
      seasons.filter((sp) => sp.status === "Dropo").length;
    const zeros =
      rows.filter((row) => !row.jogatina?.season_id && row.status === "Zero")
        .length + seasons.filter((sp) => sp.status === "Zero").length;
    const davaPraJogar =
      rows.filter(
        (row) => !row.jogatina?.season_id && row.status === "Dava pra jogar",
      ).length +
      seasons.filter((sp) => sp.status === "Dava pra jogar").length;

    const uniqueGameIds = new Set<string>();
    rows.forEach((row) => {
      if (row.jogatina?.game_id) {
        uniqueGameIds.add(row.jogatina.game_id);
      }
    });
    seasons.forEach((sp) => {
      if (sp.season?.game_id) {
        uniqueGameIds.add(sp.season.game_id);
      }
    });

    return buildLandingPlayerCardStatsFromSummary({
      player,
      totalSessions: stats.totalSessions,
      totalMinutes: stats.totalMinutes,
      drops,
      zeros,
      davaPraJogar,
      uniqueGames: uniqueGameIds.size,
    });
  });
}
