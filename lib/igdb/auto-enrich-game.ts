import { fetchIgdbGameDetails } from "./fetch-game-details";
import { mapIgdbToGameUpdate } from "./map-to-game-update";
import { searchIgdbGames } from "./search-games";
import { createServiceRoleClient } from "../supabase/service-role";

const AUTO_ENRICH_TIMEOUT_MS = 4_000;

type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function withTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Tempo limite ao consultar o IGDB")),
      AUTO_ENRICH_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Completa um jogo recém-criado quando houver uma correspondência exata no IGDB.
 * Esta função é propositalmente tolerante a falhas para nunca interromper o fluxo
 * de registro de eventos do Discord.
 */
export async function autoEnrichGameFromIgdb(
  supabase: ServiceRoleClient,
  gameId: string,
  title: string,
): Promise<void> {
  try {
    await withTimeout(enrichGame(supabase, gameId, title));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[IGDB] Enriquecimento ignorado para "${title}": ${message}`);
  }
}

async function enrichGame(
  supabase: ServiceRoleClient,
  gameId: string,
  title: string,
): Promise<void> {
  const matches = await searchIgdbGames(title);
  const normalizedTitle = normalizeTitle(title);
  const match = matches.find(
    (candidate) => normalizeTitle(candidate.name) === normalizedTitle,
  );

  if (!match) {
    console.info(`[IGDB] Nenhuma correspondência exata para "${title}".`);
    return;
  }

  const details = await fetchIgdbGameDetails(match.igdbId);
  if (!details) {
    console.info(`[IGDB] Detalhes não encontrados para "${title}".`);
    return;
  }

  const { error } = await supabase
    .from("games")
    .update(mapIgdbToGameUpdate(details, { includeCover: true }))
    .eq("id", gameId);

  if (error) {
    console.warn(`[IGDB] Não foi possível enriquecer "${title}":`, error.message);
  }
}
