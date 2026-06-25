import type { IgdbSearchMatch } from "./types";
import { normalizeGameTitle } from "./normalize-title";

export type IgdbYearFilter = "all" | "unknown" | number;

export interface IgdbMatchFilters {
  year: IgdbYearFilter;
  nameQuery: string;
}

export const DEFAULT_IGDB_MATCH_FILTERS: IgdbMatchFilters = {
  year: "all",
  nameQuery: "",
};

export function getAvailableYears(matches: IgdbSearchMatch[]): number[] {
  const years = new Set<number>();

  for (const match of matches) {
    if (match.year) years.add(match.year);
  }

  return Array.from(years).sort((a, b) => b - a);
}

export function hasMatchesWithoutYear(matches: IgdbSearchMatch[]): boolean {
  return matches.some((match) => !match.year);
}

export function getMatchRelevanceScore(matchName: string, query: string): number {
  const normalizedQuery = normalizeGameTitle(query);
  if (!normalizedQuery) return Number.MAX_SAFE_INTEGER;

  const normalizedName = normalizeGameTitle(matchName);
  const lengthPenalty = normalizedName.length - normalizedQuery.length;

  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(`${normalizedQuery} `)) return 100 + lengthPenalty;
  if (normalizedName.startsWith(normalizedQuery)) return 200 + lengthPenalty;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const allWordsPresent = queryWords.every((word) =>
    normalizedName.split(" ").includes(word),
  );

  if (allWordsPresent) {
    if (normalizedName.includes(normalizedQuery)) {
      return 300 + lengthPenalty;
    }
    return 400 + lengthPenalty;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 500 + lengthPenalty;
  }

  return 1000 + lengthPenalty;
}

function compareByYearThenName(a: IgdbSearchMatch, b: IgdbSearchMatch): number {
  if (a.year && b.year) {
    if (b.year !== a.year) return b.year - a.year;
    return a.name.localeCompare(b.name, "pt-BR");
  }

  if (a.year && !b.year) return -1;
  if (!a.year && b.year) return 1;
  return a.name.localeCompare(b.name, "pt-BR");
}

export function sortIgdbSearchMatchesByYear(
  matches: IgdbSearchMatch[],
): IgdbSearchMatch[] {
  return [...matches].sort(compareByYearThenName);
}

export interface IgdbSearchMatchSortOptions {
  nameQuery?: string;
  referenceTitle?: string;
}

export function sortIgdbSearchMatches(
  matches: IgdbSearchMatch[],
  options: IgdbSearchMatchSortOptions = {},
): IgdbSearchMatch[] {
  const relevanceQuery =
    options.nameQuery?.trim() || options.referenceTitle?.trim() || "";

  if (!relevanceQuery) {
    return sortIgdbSearchMatchesByYear(matches);
  }

  return [...matches].sort((a, b) => {
    const scoreA = getMatchRelevanceScore(a.name, relevanceQuery);
    const scoreB = getMatchRelevanceScore(b.name, relevanceQuery);

    if (scoreA !== scoreB) return scoreA - scoreB;
    return compareByYearThenName(a, b);
  });
}

export function filterIgdbSearchMatches(
  matches: IgdbSearchMatch[],
  filters: IgdbMatchFilters,
): IgdbSearchMatch[] {
  const query = filters.nameQuery.trim();
  const normalizedQuery = normalizeGameTitle(query);

  return matches.filter((match) => {
    if (filters.year !== "all") {
      if (filters.year === "unknown") {
        if (match.year) return false;
      } else if (match.year !== filters.year) {
        return false;
      }
    }

    if (normalizedQuery) {
      const normalizedName = normalizeGameTitle(match.name);
      if (!normalizedName.includes(normalizedQuery)) return false;
    }

    return true;
  });
}