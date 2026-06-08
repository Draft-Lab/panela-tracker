import type { Game } from "@/lib/types";

export type RecentExcludeDays = 7 | 14 | 30;

export type UnderplayedMode = "weighted" | "bottom_half";

export interface GameSessionStats {
  groupSessions: number;
  lastGroupPlayedAt: string | null;
}

export interface RouletteSmartFilters {
  selectedGenres: string[];
  excludeRecent: boolean;
  recentDays: RecentExcludeDays;
  prioritizeUnderplayed: boolean;
  underplayedMode: UnderplayedMode;
}

export interface RoulettePoolEntry {
  game: Game;
  stats: GameSessionStats;
  weight: number;
}

export interface BuildRoulettePoolResult {
  entries: RoulettePoolEntry[];
  excludedByRecent: number;
  excludedByGenre: number;
}

export const DEFAULT_ROULETTE_FILTERS: RouletteSmartFilters = {
  selectedGenres: [],
  excludeRecent: false,
  recentDays: 14,
  prioritizeUnderplayed: false,
  underplayedMode: "weighted",
};
