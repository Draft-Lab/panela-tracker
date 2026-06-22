import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaytimeAuditLiveStateFixActions } from "@/components/dashboard/playtime-audit/playtime-audit-live-state-fix-actions";
import {
  formatAuditTimestamp,
  minutesSinceTimestamp,
  type LiveStateActiveJogatina,
  type LiveStateActivePlayer,
  type LiveStateAuditReport,
  type LiveStateIssue,
} from "@/lib/live-state-audit";
import { formatLiveSessionElapsed } from "@/lib/live-session-helpers";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

interface PlaytimeAuditLiveStateProps {
  report: LiveStateAuditReport;
}

const issueLabels: Record<LiveStateIssue["type"], string> = {
  empty_current_session: "Sessão vazia",
  stale_session: "Sem evento há muito tempo",
  active_players_mismatch: "Contagem divergente",
  orphaned_active_player: "Jogador órfão",
};

function formatLastEvent(minutes: number | null): string {
  if (minutes === null) {
    return "sem registro";
  }

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `há ${hours}h`;
  }

  return `há ${hours}h ${mins}min`;
}

function IssueBadges({ issues }: { issues: LiveStateIssue[] }) {
  if (!issues.length) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
        OK
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {issues.map((issue) => (
        <Badge
          key={`${issue.type}-${issue.message}`}
          variant="outline"
          className="border-amber-500/40 bg-amber-500/10 text-amber-300"
          title={issue.message}
        >
          {issueLabels[issue.type]}
        </Badge>
      ))}
    </div>
  );
}

function ActiveSessionsTable({
  sessions,
}: {
  sessions: LiveStateActiveJogatina[];
}) {
  if (!sessions.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma jogatina com{" "}
        <code className="text-xs">is_current = true</code> no banco.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Jogo</th>
            <th className="px-4 py-3 font-medium">Jogadores ativos</th>
            <th className="px-4 py-3 font-medium">Último evento</th>
            <th className="px-4 py-3 font-medium">Duração</th>
            <th className="px-4 py-3 font-medium">Origem</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-t border-border/40">
              <td className="px-4 py-3 font-medium">{session.gameTitle}</td>
              <td className="px-4 py-3">
                <p>
                  {session.activePlayerNames.length
                    ? session.activePlayerNames.join(", ")
                    : "nenhum"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  campo: {session.recordedActivePlayers} · real:{" "}
                  {session.activePlayersCount}
                </p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatLastEvent(session.minutesSinceLastEvent)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {session.startedAt
                  ? formatLiveSessionElapsed(session.startedAt)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {session.source === "discord_bot" ? "Bot" : "Manual"}
              </td>
              <td className="px-4 py-3">
                <IssueBadges issues={session.issues} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrphanedPlayersTable({
  players,
}: {
  players: LiveStateActivePlayer[];
}) {
  if (!players.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum jogador com{" "}
        <code className="text-xs">is_active = true</code> fora de sessão atual.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-amber-500/30">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-amber-500/10 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Jogador</th>
            <th className="px-4 py-3 font-medium">Jogo</th>
            <th className="px-4 py-3 font-medium">Data da sessão</th>
            <th className="px-4 py-3 font-medium">Última atividade</th>
            <th className="px-4 py-3 font-medium">Marcado ativo em</th>
            <th className="px-4 py-3 font-medium">Problema</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border-t border-amber-500/20">
              <td className="px-4 py-3 font-medium">{player.playerName}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {player.gameTitle ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatAuditTimestamp(player.sessionDate)}
              </td>
              <td className="px-4 py-3">
                <p className="text-muted-foreground">
                  {formatAuditTimestamp(player.lastActivityAt)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/80">
                  {formatLastEvent(
                    minutesSinceTimestamp(player.lastActivityAt),
                  )}
                </p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatAuditTimestamp(player.playerCreatedAt)}
              </td>
              <td className="px-4 py-3">
                <IssueBadges issues={player.issues} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlaytimeAuditLiveState({ report }: PlaytimeAuditLiveStateProps) {
  const { summary } = report;
  const stuckSessions = summary.staleSessions + summary.emptySessions;

  return (
    <div className="space-y-5">
      <div
        className={`rounded-xl border p-4 ${
          report.hasIssues
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-emerald-500/30 bg-emerald-500/5"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            {report.hasIssues ? (
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Possível estado inconsistente no banco
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Nenhuma inconsistência detectada
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Útil para debug quando o bot caiu ou alguém ficou preso como
              ativo. Sessões sem evento há mais de 12h são sinalizadas.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/jogos-atuais">
              Abrir jogos atuais
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          <PlaytimeAuditLiveStateFixActions
            orphanedPlayers={summary.orphanedPlayers}
            stuckSessions={stuckSessions}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3">
          <p className="text-xs text-muted-foreground">Sessões ativas</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {summary.currentSessions}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            Jogadores ativos
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {summary.totalActivePlayers}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3">
          <p className="text-xs text-muted-foreground">Sessões com alerta</p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              summary.sessionsWithIssues > 0
                ? "text-amber-400"
                : "text-foreground"
            }`}
          >
            {summary.sessionsWithIssues}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Jogadores órfãos
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              summary.orphanedPlayers > 0 ? "text-amber-400" : "text-foreground"
            }`}
          >
            {summary.orphanedPlayers}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Jogatinas ativas no banco</h3>
        <ActiveSessionsTable sessions={report.activeJogatinas} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Jogadores ativos fora de sessão</h3>
        <OrphanedPlayersTable players={report.orphanedActivePlayers} />
      </div>
    </div>
  );
}
