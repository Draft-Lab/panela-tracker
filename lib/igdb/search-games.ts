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

export async function searchIgdbGames(title: string): Promise<IgdbSearchMatch[]> {
  const escapedTitle = escapeSearchTerm(title.trim());
  const body = [
    "fields id,name,summary,first_release_date,cover.image_id;",
    `search "${escapedTitle}";`,
    "where version_parent = null;",
    "limit 10;",
  ].join(" ");

  const results = await igdbPost<IgdbSearchResult>("games", body);

  return results.map((game) => ({
    igdbId: game.id,
    name: game.name ?? "Sem nome",
    year: getYearFromTimestamp(game.first_release_date),
    coverUrl: game.cover?.image_id
      ? buildIgdbImageUrl(game.cover.image_id, "cover_small")
      : undefined,
    summary: game.summary,
  }));
}
