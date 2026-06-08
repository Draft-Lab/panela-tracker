import type { Game } from "@/lib/types";

export function extractLibraryGenres(games: Game[]): string[] {
  const genres = new Set<string>();

  for (const game of games) {
    game.genres?.forEach((genre) => genres.add(genre));
  }

  return Array.from(genres).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function gameMatchesGenres(game: Game, selectedGenres: string[]): boolean {
  if (selectedGenres.length === 0) return true;
  if (!game.genres?.length) return false;

  return selectedGenres.some((genre) => game.genres?.includes(genre));
}
