import type { PlayerPlatinumGame } from "@/lib/types";

export interface SplitPlatinumGames {
  platinando: PlayerPlatinumGame | null;
  platinados: PlayerPlatinumGame[];
}

export function splitPlatinumGames(
  entries: PlayerPlatinumGame[],
): SplitPlatinumGames {
  const platinando =
    entries.find((entry) => entry.status === "platinando") ?? null;

  const platinados = sortPlatinadosByDate(
    entries.filter((entry) => entry.status === "platinado"),
  );

  return { platinando, platinados };
}

export function sortPlatinadosByDate(
  entries: PlayerPlatinumGame[],
): PlayerPlatinumGame[] {
  return [...entries].sort((a, b) => {
    const dateA = a.completed_at ?? a.created_at;
    const dateB = b.completed_at ?? b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function getGameTitle(entry: PlayerPlatinumGame): string {
  return entry.game?.title ?? "Jogo desconhecido";
}

export function getGameCover(entry: PlayerPlatinumGame): string | null {
  return entry.game?.cover_url ?? null;
}
