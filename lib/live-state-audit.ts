import type { createClient } from "@/lib/supabase/server";
import { getLiveSessionStartedAt } from "@/lib/live-session-helpers";
import { getJogatinaLastActivityAt } from "@/lib/jogatina-date-helpers";
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export const STALE_SESSION_HOURS = 12;

export type LiveStateIssueType =
  | "empty_current_session"
  | "stale_session"
  | "active_players_mismatch"
  | "orphaned_active_player";

export interface LiveStateIssue {
  type: LiveStateIssueType;
  message: string;
}

export interface LiveStateActiveJogatina {
  id: string;
  gameId: string;
  gameTitle: string;
  source: string;
  sessionType: string;
  activePlayersCount: number;
  recordedActivePlayers: number;
  startedAt: string | null;
  lastEventAt: string | null;
  minutesSinceLastEvent: number | null;
  activePlayerNames: string[];
  issues: LiveStateIssue[];
}

export interface LiveStateActivePlayer {
  id: string;
  playerId: string;
  playerName: string;
  jogatinaId: string;
  gameTitle: string | null;
  jogatinaIsCurrent: boolean;
  sessionDate: string | null;
  lastActivityAt: string | null;
  playerCreatedAt: string | null;
  issues: LiveStateIssue[];
}

export interface LiveStateAuditSummary {
  currentSessions: number;
  totalActivePlayers: number;
  orphanedPlayers: number;
  sessionsWithIssues: number;
  staleSessions: number;
  emptySessions: number;
}

export interface LiveStateAuditReport {
  generatedAt: string;
  activeJogatinas: LiveStateActiveJogatina[];
  activePlayers: LiveStateActivePlayer[];
  orphanedActivePlayers: LiveStateActivePlayer[];
  hasIssues: boolean;
  summary: LiveStateAuditSummary;
}

type RawJogatinaPlayer = {
  id: string;
  player_id: string;
  is_active: boolean;
  player: { id: string; name: string } | null;
};

type RawCurrentJogatina = {
  id: string;
  game_id: string;
  source: string;
  session_type: string;
  first_event_at: string | null;
  last_event_at: string | null;
  date: string;
  active_players: number;
  game: { id: string; title: string } | null;
  jogatina_players: RawJogatinaPlayer[] | null;
};

type RawActivePlayerRow = {
  id: string;
  player_id: string;
  jogatina_id: string;
  created_at: string;
  player: { id: string; name: string } | null;
  jogatina: {
    id: string;
    is_current: boolean;
    date: string;
    first_event_at: string | null;
    last_event_at: string | null;
    game: { title: string } | null;
  } | null;
};

export function minutesSinceTimestamp(
  value: string | null,
  now: Date = new Date(),
): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return Math.max(0, Math.floor((now.getTime() - timestamp.getTime()) / 60_000));
}

export function buildJogatinaIssues(input: {
  activePlayersCount: number;
  recordedActivePlayers: number;
  minutesSinceLastEvent: number | null;
}): LiveStateIssue[] {
  const issues: LiveStateIssue[] = [];
  const staleThresholdMinutes = STALE_SESSION_HOURS * 60;

  if (input.activePlayersCount === 0) {
    issues.push({
      type: "empty_current_session",
      message: "Sessão marcada como atual, mas sem jogadores ativos.",
    });
  }

  if (
    input.minutesSinceLastEvent !== null &&
    input.minutesSinceLastEvent >= staleThresholdMinutes
  ) {
    issues.push({
      type: "stale_session",
      message: `Sem evento há ${Math.floor(input.minutesSinceLastEvent / 60)}h+ (limite: ${STALE_SESSION_HOURS}h).`,
    });
  }

  if (input.recordedActivePlayers !== input.activePlayersCount) {
    issues.push({
      type: "active_players_mismatch",
      message: `Campo active_players (${input.recordedActivePlayers}) difere dos jogadores ativos (${input.activePlayersCount}).`,
    });
  }

  return issues;
}

export function sortPlayersByLastActivity(
  players: LiveStateActivePlayer[],
): LiveStateActivePlayer[] {
  return [...players].sort((left, right) => {
    const leftTime = left.lastActivityAt
      ? new Date(left.lastActivityAt).getTime()
      : 0;
    const rightTime = right.lastActivityAt
      ? new Date(right.lastActivityAt).getTime()
      : 0;

    return rightTime - leftTime;
  });
}

export function formatAuditTimestamp(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildOrphanedPlayerIssue(): LiveStateIssue[] {
  return [
    {
      type: "orphaned_active_player",
      message: "Jogador ativo em sessão que não está marcada como atual.",
    },
  ];
}

function mapCurrentJogatina(
  row: RawCurrentJogatina,
  now: Date,
): LiveStateActiveJogatina {
  const players = row.jogatina_players ?? [];
  const activePlayers = players.filter((player) => player.is_active);
  const lastEventAt = row.last_event_at ?? row.first_event_at ?? row.date;
  const minutesSinceLastEvent = minutesSinceTimestamp(lastEventAt, now);
  const activePlayersCount = activePlayers.length;

  return {
    id: row.id,
    gameId: row.game_id,
    gameTitle: row.game?.title ?? "Jogo desconhecido",
    source: row.source,
    sessionType: row.session_type,
    activePlayersCount,
    recordedActivePlayers: row.active_players,
    startedAt: getLiveSessionStartedAt(row),
    lastEventAt,
    minutesSinceLastEvent,
    activePlayerNames: activePlayers
      .map((player) => player.player?.name)
      .filter((name): name is string => Boolean(name)),
    issues: buildJogatinaIssues({
      activePlayersCount,
      recordedActivePlayers: row.active_players,
      minutesSinceLastEvent,
    }),
  };
}

function mapActivePlayer(row: RawActivePlayerRow): LiveStateActivePlayer {
  const jogatina = row.jogatina;
  const jogatinaIsCurrent = jogatina?.is_current ?? false;
  const lastActivityAt = jogatina
    ? getJogatinaLastActivityAt(jogatina)
    : null;

  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player?.name ?? "Jogador desconhecido",
    jogatinaId: row.jogatina_id,
    gameTitle: jogatina?.game?.title ?? null,
    jogatinaIsCurrent,
    sessionDate: jogatina?.date ?? null,
    lastActivityAt,
    playerCreatedAt: row.created_at,
    issues: jogatinaIsCurrent ? [] : buildOrphanedPlayerIssue(),
  };
}

function buildSummary(
  activeJogatinas: LiveStateActiveJogatina[],
  activePlayers: LiveStateActivePlayer[],
  orphanedActivePlayers: LiveStateActivePlayer[],
): LiveStateAuditSummary {
  const sessionsWithIssues = activeJogatinas.filter(
    (session) => session.issues.length > 0,
  ).length;

  return {
    currentSessions: activeJogatinas.length,
    totalActivePlayers: activePlayers.length,
    orphanedPlayers: orphanedActivePlayers.length,
    sessionsWithIssues,
    staleSessions: activeJogatinas.filter((session) =>
      session.issues.some((issue) => issue.type === "stale_session"),
    ).length,
    emptySessions: activeJogatinas.filter((session) =>
      session.issues.some((issue) => issue.type === "empty_current_session"),
    ).length,
  };
}

async function fetchCurrentJogatinas(
  supabase: SupabaseClient,
): Promise<RawCurrentJogatina[]> {
  const { data, error } = await supabase
    .from("jogatinas")
    .select(
      `
      id,
      game_id,
      source,
      session_type,
      first_event_at,
      last_event_at,
      date,
      active_players,
      game:games(id, title),
      jogatina_players(
        id,
        player_id,
        is_active,
        player:players(id, name)
      )
    `,
    )
    .eq("is_current", true)
    .order("last_event_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    game_id: row.game_id,
    source: row.source,
    session_type: row.session_type,
    first_event_at: row.first_event_at,
    last_event_at: row.last_event_at,
    date: row.date,
    active_players: row.active_players,
    game: normalizeSupabaseRelation(row.game),
    jogatina_players: (row.jogatina_players ?? []).map((player) => ({
      id: player.id,
      player_id: player.player_id,
      is_active: player.is_active,
      player: normalizeSupabaseRelation(player.player),
    })),
  }));
}

async function fetchActivePlayers(
  supabase: SupabaseClient,
): Promise<RawActivePlayerRow[]> {
  const { data, error } = await supabase
    .from("jogatina_players")
    .select(
      `
      id,
      player_id,
      jogatina_id,
      created_at,
      player:players(id, name),
      jogatina:jogatinas(
        id,
        is_current,
        date,
        first_event_at,
        last_event_at,
        game:games(title)
      )
    `,
    )
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const jogatina = normalizeSupabaseRelation(row.jogatina);

    return {
      id: row.id,
      player_id: row.player_id,
      jogatina_id: row.jogatina_id,
      created_at: row.created_at,
      player: normalizeSupabaseRelation(row.player),
      jogatina: jogatina
        ? {
            id: jogatina.id,
            is_current: jogatina.is_current,
            date: jogatina.date,
            first_event_at: jogatina.first_event_at,
            last_event_at: jogatina.last_event_at,
            game: normalizeSupabaseRelation(jogatina.game),
          }
        : null,
    };
  });
}

export async function buildLiveStateAuditReport(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<LiveStateAuditReport> {
  const [currentRows, activePlayerRows] = await Promise.all([
    fetchCurrentJogatinas(supabase),
    fetchActivePlayers(supabase),
  ]);

  const activeJogatinas = currentRows.map((row) => mapCurrentJogatina(row, now));
  const activePlayers = activePlayerRows.map(mapActivePlayer);
  const orphanedActivePlayers = sortPlayersByLastActivity(
    activePlayers.filter((player) => player.issues.length > 0),
  );
  const summary = buildSummary(
    activeJogatinas,
    activePlayers,
    orphanedActivePlayers,
  );

  return {
    generatedAt: now.toISOString(),
    activeJogatinas,
    activePlayers,
    orphanedActivePlayers,
    hasIssues:
      summary.sessionsWithIssues > 0 || summary.orphanedPlayers > 0,
    summary,
  };
}
