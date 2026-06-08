import type { Game } from "@/lib/types";
import { gameMatchesGenres } from "./extract-genres";
import { getGameSessionStats } from "./game-session-stats";
import {
  applyBottomHalfFilter,
  computeSessionWeight,
} from "./pick-winner";
import type {
  BuildRoulettePoolResult,
  GameSessionStats,
  RoulettePoolEntry,
  RouletteSmartFilters,
} from "./types";

function isRecentlyPlayed(
  stats: GameSessionStats,
  recentDays: number,
): boolean {
  if (!stats.lastGroupPlayedAt) return false;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - recentDays);

  return new Date(stats.lastGroupPlayedAt) >= cutoff;
}

export function buildRoulettePool(
  games: Game[],
  statsMap: Map<string, GameSessionStats>,
  filters: RouletteSmartFilters,
  manuallySelectedIds: Set<string>,
): BuildRoulettePoolResult {
  let excludedByGenre = 0;
  let excludedByRecent = 0;

  let entries: RoulettePoolEntry[] = games
    .filter((game) => manuallySelectedIds.has(game.id))
    .filter((game) => {
      const matchesGenre = gameMatchesGenres(game, filters.selectedGenres);
      if (!matchesGenre) excludedByGenre += 1;
      return matchesGenre;
    })
    .map((game) => {
      const stats = getGameSessionStats(statsMap, game.id);
      return {
        game,
        stats,
        weight: computeSessionWeight(stats.groupSessions),
      };
    })
    .filter((entry) => {
      if (!filters.excludeRecent) return true;

      const recent = isRecentlyPlayed(entry.stats, filters.recentDays);
      if (recent) excludedByRecent += 1;
      return !recent;
    });

  if (filters.prioritizeUnderplayed && filters.underplayedMode === "bottom_half") {
    entries = applyBottomHalfFilter(entries);
  }

  if (filters.prioritizeUnderplayed && filters.underplayedMode === "weighted") {
    entries = entries.map((entry) => ({
      ...entry,
      weight: computeSessionWeight(entry.stats.groupSessions),
    }));
  } else {
    entries = entries.map((entry) => ({
      ...entry,
      weight: 1,
    }));
  }

  return {
    entries,
    excludedByRecent,
    excludedByGenre,
  };
}

/** Jogos que passam pelos filtros inteligentes (ignora seleção manual). */
export function buildEligiblePool(
  games: Game[],
  statsMap: Map<string, GameSessionStats>,
  filters: RouletteSmartFilters,
): BuildRoulettePoolResult {
  const allIds = new Set(games.map((game) => game.id));
  return buildRoulettePool(games, statsMap, filters, allIds);
}
