import type { IgdbSearchMatch } from "./types";
import { normalizeGameTitle } from "./normalize-title";

export async function searchIgdbMatches(
  title: string,
): Promise<IgdbSearchMatch[]> {
  const response = await fetch("/api/games/igdb/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao buscar no IGDB");
  }

  return (data.matches ?? []) as IgdbSearchMatch[];
}

export async function enrichGameWithIgdb(
  gameId: string,
  igdbId: number,
): Promise<void> {
  const response = await fetch("/api/games/igdb/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, igdbId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao enriquecer jogo");
  }
}

export function resolveAutoIgdbMatch(
  title: string,
  matches: IgdbSearchMatch[],
): IgdbSearchMatch | null {
  if (matches.length === 0) return null;

  const normalizedTitle = normalizeGameTitle(title);
  const exactMatch = matches.find(
    (match) => normalizeGameTitle(match.name) === normalizedTitle,
  );

  if (exactMatch) return exactMatch;
  if (matches.length === 1) return matches[0];

  return null;
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Operação cancelada", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Operação cancelada", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export const IGDB_BULK_DELAY_MS = 5000;
