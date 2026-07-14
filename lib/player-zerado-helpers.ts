import { createClient } from "@/lib/supabase/client";
import type { Game } from "@/lib/types";

export interface EligibleSeasonZeradoGame {
  game_id: string;
  game: Pick<Game, "id" | "title" | "cover_url">;
  season_name: string | null;
}

/**
 * Games from seasons where the player has status "Zero",
 * excluding games already in platinum or already in zerados.
 */
export async function listEligibleSeasonZeradoGames(
  playerId: string,
): Promise<EligibleSeasonZeradoGame[]> {
  const supabase = createClient();

  const [seasonResult, platinumResult, zeradoResult] = await Promise.all([
    supabase
      .from("season_participants")
      .select(
        `
        status,
        season:seasons(
          name,
          game_id,
          game:games(id, title, cover_url)
        )
      `,
      )
      .eq("player_id", playerId)
      .eq("status", "Zero"),
    supabase
      .from("player_platinum_games")
      .select("game_id")
      .eq("player_id", playerId),
    supabase
      .from("player_zerado_games")
      .select("game_id")
      .eq("player_id", playerId),
  ]);

  if (seasonResult.error) throw seasonResult.error;
  if (platinumResult.error) throw platinumResult.error;
  if (zeradoResult.error) throw zeradoResult.error;

  const excluded = new Set<string>([
    ...(platinumResult.data ?? []).map((row: { game_id: string }) => row.game_id),
    ...(zeradoResult.data ?? []).map((row: { game_id: string }) => row.game_id),
  ]);

  const seen = new Set<string>();
  const eligible: EligibleSeasonZeradoGame[] = [];

  for (const row of seasonResult.data ?? []) {
    const season = row.season as
      | {
          name: string | null;
          game_id: string;
          game: Pick<Game, "id" | "title" | "cover_url"> | null;
        }
      | null;

    if (!season?.game_id || !season.game) continue;
    if (excluded.has(season.game_id) || seen.has(season.game_id)) continue;

    seen.add(season.game_id);
    eligible.push({
      game_id: season.game_id,
      game: season.game,
      season_name: season.name,
    });
  }

  return eligible;
}

export function filterZeradosExcludingPlatinum<
  T extends { game_id: string },
>(zerados: T[], platinumGameIds: Set<string> | string[]): T[] {
  const excluded =
    platinumGameIds instanceof Set
      ? platinumGameIds
      : new Set(platinumGameIds);

  return zerados.filter((entry) => !excluded.has(entry.game_id));
}

export function sortZeradosByDate<
  T extends { completed_at: string | null; created_at: string },
>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const dateA = a.completed_at ?? a.created_at;
    const dateB = b.completed_at ?? b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function getZeradoGameTitle(entry: {
  game?: { title?: string } | null;
}): string {
  return entry.game?.title ?? "Jogo desconhecido";
}

export function getZeradoGameCover(entry: {
  game?: { cover_url?: string | null } | null;
}): string | null {
  return entry.game?.cover_url ?? null;
}
