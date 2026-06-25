import { buildIgdbImageUrl } from "./build-image-url";
import { igdbPost } from "./client";
import type { IgdbSearchMatch, IgdbSearchResult } from "./types";

function escapeSearchTerm(title: string): string {
  return title.replace(/"/g, '\\"');
}

function getYearFromTimestamp(timestamp?: number): number | undefined {
  if (!timestamp) return undefined;
  return new Date(timestamp * 1000).getFullYear();
}

const IGDB_SEARCH_PAGE_SIZE = 500;
const IGDB_SEARCH_MAX_RESULTS = 5000;

function mapSearchResult(game: IgdbSearchResult): IgdbSearchMatch {
  return {
    igdbId: game.id,
    name: game.name ?? "Sem nome",
    year: getYearFromTimestamp(game.first_release_date),
    coverUrl: game.cover?.image_id
      ? buildIgdbImageUrl(game.cover.image_id, "cover_small")
      : undefined,
    summary: game.summary,
  };
}

async function fetchSearchPage(
  escapedTitle: string,
  offset: number,
): Promise<IgdbSearchResult[]> {
  const body = [
    "fields id,name,summary,first_release_date,cover.image_id;",
    `search "${escapedTitle}";`,
    "where version_parent = null;",
    `limit ${IGDB_SEARCH_PAGE_SIZE};`,
    `offset ${offset};`,
  ].join(" ");

  return igdbPost<IgdbSearchResult>("games", body);
}

export async function searchIgdbGames(title: string): Promise<IgdbSearchMatch[]> {
  const escapedTitle = escapeSearchTerm(title.trim());
  const results: IgdbSearchResult[] = [];
  let offset = 0;

  while (results.length < IGDB_SEARCH_MAX_RESULTS) {
    const page = await fetchSearchPage(escapedTitle, offset);
    results.push(...page);

    if (page.length < IGDB_SEARCH_PAGE_SIZE) break;
    offset += IGDB_SEARCH_PAGE_SIZE;
  }

  return results.map(mapSearchResult);
}
