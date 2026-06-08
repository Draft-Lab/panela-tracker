import type { Game } from "@/lib/types";

export function getGameReleaseYear(game: Game): number | null {
  if (!game.first_release_date) return null;
  return new Date(game.first_release_date).getFullYear();
}

export function hasIgdbMeta(game: Game): boolean {
  return Boolean(
    game.igdb_id ||
      game.rating != null ||
      game.genres?.length ||
      game.first_release_date,
  );
}

export function getGameGenrePreview(
  game: Game,
  limit = 2,
): string[] {
  return game.genres?.slice(0, limit) ?? [];
}

export function formatGameMetaLine(game: Game): string | null {
  if (!hasIgdbMeta(game)) return null;

  const parts: string[] = [];
  const year = getGameReleaseYear(game);

  if (year) parts.push(String(year));

  const genres = getGameGenrePreview(game, 2);
  if (genres.length > 0) parts.push(genres.join(", "));

  if (game.rating != null) {
    parts.push(`${Math.round(game.rating)}/100`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
