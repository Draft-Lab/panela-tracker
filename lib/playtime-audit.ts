import type { createClient } from "@/lib/supabase/server";
import {
  accumulateFinishedPlaytimeRow,
  fetchPlaytimeDurationTotals,
  playtimeMinutesMatch,
  playtimeTotalsMatch,
  playtimeTotalsToHours,
  type PlaytimeDurationTotals,
} from "@/lib/landing-playtime-totals";
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const PAGE_SIZE = 1000;

export interface PlaytimeAuditHours {
  gameHours: number;
  appHours: number;
  totalHours: number;
}

export interface PlaytimeAuditMethodResult {
  id: "landing" | "independent" | "player_minutes";
  label: string;
  description: string;
  totals: PlaytimeDurationTotals;
  hours: PlaytimeAuditHours;
}

export interface PlaytimeAuditDiagnostics {
  jogatinasFetched: number;
  uniqueJogatinas: number;
  finishedSessions: number;
  activeSessions: number;
  missingGameLink: number;
  finishedNullDuration: number;
  finishedZeroDuration: number;
  finishedWithDuration: number;
  duplicateIdsSkipped: number;
}

export interface PlaytimeAuditOutlier {
  id: string;
  gameTitle: string;
  isApp: boolean;
  minutes: number;
  isCurrent: boolean;
  source: string;
  date: string;
}

export interface PlaytimeAuditReport {
  generatedAt: string;
  methods: PlaytimeAuditMethodResult[];
  landingMatchesIndependent: boolean;
  landingMinutesMatch: boolean;
  diagnostics: PlaytimeAuditDiagnostics;
  outliers: PlaytimeAuditOutlier[];
}

type AuditJogatinaRow = {
  id: string;
  total_duration_minutes: number | null;
  is_current: boolean;
  source: string;
  date: string;
  game: { id: string; title: string; is_app: boolean } | null;
};

type AuditPlayerRow = {
  total_duration_minutes: number | null;
  jogatina: {
    is_current: boolean;
    game: { is_app: boolean } | null;
  } | null;
};

function emptyTotals(): PlaytimeDurationTotals {
  return { gameMinutes: 0, appMinutes: 0, sessionCount: 0 };
}

function toMethodResult(
  id: PlaytimeAuditMethodResult["id"],
  label: string,
  description: string,
  totals: PlaytimeDurationTotals,
): PlaytimeAuditMethodResult {
  const hours = playtimeTotalsToHours(totals);

  return {
    id,
    label,
    description,
    totals,
    hours: {
      gameHours: hours.gameHours,
      appHours: hours.appHours,
      totalHours: hours.totalHours,
    },
  };
}

async function fetchAllJogatinasForAudit(
  supabase: SupabaseClient,
): Promise<AuditJogatinaRow[]> {
  const allRows: AuditJogatinaRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("jogatinas")
      .select(
        "id, total_duration_minutes, is_current, source, date, game:games(id, title, is_app)",
      )
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    if (!rows.length) {
      break;
    }

    allRows.push(
      ...rows.map((row) => ({
        id: row.id,
        total_duration_minutes: row.total_duration_minutes,
        is_current: row.is_current,
        source: row.source,
        date: row.date,
        game: normalizeSupabaseRelation(row.game),
      })),
    );

    if (rows.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allRows;
}

async function fetchAllPlayerMinutesForAudit(
  supabase: SupabaseClient,
): Promise<AuditPlayerRow[]> {
  const allRows: AuditPlayerRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("jogatina_players")
      .select(
        "total_duration_minutes, jogatina:jogatinas(is_current, game:games(is_app))",
      )
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    if (!rows.length) {
      break;
    }

    allRows.push(
      ...rows.map((row) => {
        const jogatina = normalizeSupabaseRelation(row.jogatina);

        return {
          total_duration_minutes: row.total_duration_minutes,
          jogatina: jogatina
            ? {
                is_current: jogatina.is_current,
                game: normalizeSupabaseRelation(jogatina.game),
              }
            : null,
        };
      }),
    );

    if (rows.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allRows;
}

function buildIndependentTotals(
  rows: AuditJogatinaRow[],
): {
  totals: PlaytimeDurationTotals;
  diagnostics: PlaytimeAuditDiagnostics;
  outliers: PlaytimeAuditOutlier[];
} {
  const totals = emptyTotals();
  const seenIds = new Set<string>();
  let duplicateIdsSkipped = 0;
  let finishedSessions = 0;
  let activeSessions = 0;
  let missingGameLink = 0;
  let finishedNullDuration = 0;
  let finishedZeroDuration = 0;
  let finishedWithDuration = 0;

  const outlierCandidates: PlaytimeAuditOutlier[] = [];

  for (const row of rows) {
    if (seenIds.has(row.id)) {
      duplicateIdsSkipped += 1;
      continue;
    }

    seenIds.add(row.id);

    if (row.is_current) {
      activeSessions += 1;
      continue;
    }

    finishedSessions += 1;

    const result = accumulateFinishedPlaytimeRow(totals, {
      total_duration_minutes: row.total_duration_minutes,
      game: row.game,
    });

    if (result === "missing_game") {
      missingGameLink += 1;
      continue;
    }

    const minutes = row.total_duration_minutes;

    if (minutes === null) {
      finishedNullDuration += 1;
    } else if (minutes <= 0) {
      finishedZeroDuration += 1;
    } else {
      finishedWithDuration += 1;

      outlierCandidates.push({
        id: row.id,
        gameTitle: row.game!.title,
        isApp: row.game!.is_app,
        minutes,
        isCurrent: row.is_current,
        source: row.source,
        date: row.date,
      });
    }
  }

  outlierCandidates.sort((a, b) => b.minutes - a.minutes);

  return {
    totals,
    diagnostics: {
      jogatinasFetched: rows.length,
      uniqueJogatinas: seenIds.size,
      finishedSessions,
      activeSessions,
      missingGameLink,
      finishedNullDuration,
      finishedZeroDuration,
      finishedWithDuration,
      duplicateIdsSkipped,
    },
    outliers: outlierCandidates,
  };
}

function buildPlayerMinutesTotals(rows: AuditPlayerRow[]): PlaytimeDurationTotals {
  const totals = emptyTotals();

  for (const row of rows) {
    const jogatina = row.jogatina;
    if (!jogatina || jogatina.is_current || !jogatina.game) {
      continue;
    }

    const minutes = Math.max(0, row.total_duration_minutes ?? 0);
    if (minutes <= 0) {
      continue;
    }

    totals.sessionCount += 1;

    if (jogatina.game.is_app) {
      totals.appMinutes += minutes;
    } else {
      totals.gameMinutes += minutes;
    }
  }

  return totals;
}

export async function buildPlaytimeAuditReport(
  supabase: SupabaseClient,
): Promise<PlaytimeAuditReport> {
  const [landingTotals, allJogatinas, allPlayerRows] = await Promise.all([
    fetchPlaytimeDurationTotals(supabase),
    fetchAllJogatinasForAudit(supabase),
    fetchAllPlayerMinutesForAudit(supabase),
  ]);

  const independent = buildIndependentTotals(allJogatinas);
  const playerTotals = buildPlayerMinutesTotals(allPlayerRows);

  const methods: PlaytimeAuditMethodResult[] = [
    toMethodResult(
      "landing",
      "Landing (hero)",
      "Mesma função usada na home: sessões finalizadas com jogo linkado.",
      landingTotals,
    ),
    toMethodResult(
      "independent",
      "Varredura independente",
      "Busca todas as jogatinas e recalcula do zero no servidor.",
      independent.totals,
    ),
    toMethodResult(
      "player_minutes",
      "Soma por jogador",
      "Soma jogatina_players.total_duration_minutes. Em grupo, cada pessoa conta separado.",
      playerTotals,
    ),
  ];

  return {
    generatedAt: new Date().toISOString(),
    methods,
    landingMinutesMatch: playtimeMinutesMatch(landingTotals, independent.totals),
    landingMatchesIndependent: playtimeTotalsMatch(
      landingTotals,
      independent.totals,
    ),
    diagnostics: independent.diagnostics,
    outliers: independent.outliers,
  };
}
