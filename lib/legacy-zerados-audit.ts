import type { createClient } from "@/lib/supabase/server";
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type LegacyZeradoSource = "jogatina" | "season" | "ambos";

export type LegacyZeradoMigrationStatus =
  | "pendente"
  | "ja_migrado"
  | "bloqueado_platinagem";

export interface LegacyZeradoAuditRow {
  playerId: string;
  playerName: string;
  gameId: string;
  gameTitle: string;
  isApp: boolean;
  source: LegacyZeradoSource;
  jogatinaCount: number;
  seasonCount: number;
  migrationStatus: LegacyZeradoMigrationStatus;
}

export interface LegacyZeradosAuditReport {
  generatedAt: string;
  rows: LegacyZeradoAuditRow[];
  summary: {
    totalPairs: number;
    pending: number;
    alreadyMigrated: number;
    blockedByPlatinum: number;
    fromJogatinaOnly: number;
    fromSeasonOnly: number;
    fromBoth: number;
  };
}

interface RawPair {
  playerId: string;
  playerName: string;
  gameId: string;
  gameTitle: string;
  isApp: boolean;
  jogatinaCount: number;
  seasonCount: number;
}

function emptySummary(): LegacyZeradosAuditReport["summary"] {
  return {
    totalPairs: 0,
    pending: 0,
    alreadyMigrated: 0,
    blockedByPlatinum: 0,
    fromJogatinaOnly: 0,
    fromSeasonOnly: 0,
    fromBoth: 0,
  };
}

function pairKey(playerId: string, gameId: string): string {
  return `${playerId}:${gameId}`;
}

function resolveSource(
  jogatinaCount: number,
  seasonCount: number,
): LegacyZeradoSource {
  if (jogatinaCount > 0 && seasonCount > 0) return "ambos";
  if (seasonCount > 0) return "season";
  return "jogatina";
}

export async function buildLegacyZeradosAuditReport(
  supabase: SupabaseClient,
): Promise<LegacyZeradosAuditReport> {
  const [jogatinaResult, seasonResult, zeradoResult, platinumResult] =
    await Promise.all([
      supabase
        .from("jogatina_players")
        .select(
          `
          player_id,
          status,
          player:players(id, name),
          jogatina:jogatinas(
            game_id,
            game:games(id, title, is_app)
          )
        `,
        )
        .eq("status", "Zero"),
      supabase
        .from("season_participants")
        .select(
          `
          player_id,
          status,
          player:players(id, name),
          season:seasons(
            game_id,
            game:games(id, title, is_app)
          )
        `,
        )
        .eq("status", "Zero"),
      supabase.from("player_zerado_games").select("player_id, game_id"),
      supabase.from("player_platinum_games").select("player_id, game_id"),
    ]);

  if (jogatinaResult.error) {
    console.error(
      "[legacy-zerados-audit] jogatina_players:",
      jogatinaResult.error,
    );
  }
  if (seasonResult.error) {
    console.error(
      "[legacy-zerados-audit] season_participants:",
      seasonResult.error,
    );
  }

  const pairs = new Map<string, RawPair>();

  for (const row of jogatinaResult.data ?? []) {
    const player = normalizeSupabaseRelation(row.player);
    const jogatina = normalizeSupabaseRelation(row.jogatina);
    const game = normalizeSupabaseRelation(jogatina?.game);
    const playerId = (row.player_id as string) ?? player?.id;
    const gameId = (jogatina?.game_id as string) ?? game?.id;
    if (!playerId || !gameId) continue;

    const key = pairKey(playerId, gameId);
    const existing = pairs.get(key);
    if (existing) {
      existing.jogatinaCount += 1;
      continue;
    }

    pairs.set(key, {
      playerId,
      playerName: (player?.name as string) ?? "Jogador",
      gameId,
      gameTitle: (game?.title as string) ?? "Jogo desconhecido",
      isApp: Boolean(game?.is_app),
      jogatinaCount: 1,
      seasonCount: 0,
    });
  }

  for (const row of seasonResult.data ?? []) {
    const player = normalizeSupabaseRelation(row.player);
    const season = normalizeSupabaseRelation(row.season);
    const game = normalizeSupabaseRelation(season?.game);
    const playerId = (row.player_id as string) ?? player?.id;
    const gameId = (season?.game_id as string) ?? game?.id;
    if (!playerId || !gameId) continue;

    const key = pairKey(playerId, gameId);
    const existing = pairs.get(key);
    if (existing) {
      existing.seasonCount += 1;
      continue;
    }

    pairs.set(key, {
      playerId,
      playerName: (player?.name as string) ?? "Jogador",
      gameId,
      gameTitle: (game?.title as string) ?? "Jogo desconhecido",
      isApp: Boolean(game?.is_app),
      jogatinaCount: 0,
      seasonCount: 1,
    });
  }

  const migrated = new Set(
    (zeradoResult.data ?? []).map(
      (row) => pairKey(row.player_id as string, row.game_id as string),
    ),
  );
  const platinum = new Set(
    (platinumResult.data ?? []).map(
      (row) => pairKey(row.player_id as string, row.game_id as string),
    ),
  );

  const rows: LegacyZeradoAuditRow[] = Array.from(pairs.values())
    .filter((pair) => !pair.isApp)
    .map((pair) => {
      const key = pairKey(pair.playerId, pair.gameId);
      let migrationStatus: LegacyZeradoMigrationStatus = "pendente";
      if (platinum.has(key)) {
        migrationStatus = "bloqueado_platinagem";
      } else if (migrated.has(key)) {
        migrationStatus = "ja_migrado";
      }

      return {
        playerId: pair.playerId,
        playerName: pair.playerName,
        gameId: pair.gameId,
        gameTitle: pair.gameTitle,
        isApp: pair.isApp,
        source: resolveSource(pair.jogatinaCount, pair.seasonCount),
        jogatinaCount: pair.jogatinaCount,
        seasonCount: pair.seasonCount,
        migrationStatus,
      };
    })
    .sort((a, b) => {
      const byPlayer = a.playerName.localeCompare(b.playerName, "pt-BR");
      if (byPlayer !== 0) return byPlayer;
      return a.gameTitle.localeCompare(b.gameTitle, "pt-BR");
    });

  const summary = emptySummary();
  summary.totalPairs = rows.length;
  for (const row of rows) {
    if (row.migrationStatus === "pendente") summary.pending += 1;
    if (row.migrationStatus === "ja_migrado") summary.alreadyMigrated += 1;
    if (row.migrationStatus === "bloqueado_platinagem") {
      summary.blockedByPlatinum += 1;
    }
    if (row.source === "jogatina") summary.fromJogatinaOnly += 1;
    if (row.source === "season") summary.fromSeasonOnly += 1;
    if (row.source === "ambos") summary.fromBoth += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    rows,
    summary,
  };
}
