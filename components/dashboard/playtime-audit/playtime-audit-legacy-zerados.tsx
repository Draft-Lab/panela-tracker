import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { LegacyZeradoMigrateButton } from "@/components/dashboard/playtime-audit/legacy-zerado-migrate-button";
import { LegacyZeradoMigrateAllButton } from "@/components/dashboard/playtime-audit/legacy-zerado-migrate-all-button";
import { glassSubtle } from "@/lib/glass-styles";
import type {
  LegacyZeradoAuditRow,
  LegacyZeradoMigrationStatus,
  LegacyZeradoSource,
  LegacyZeradosAuditReport,
} from "@/lib/legacy-zerados-audit";
import { cn } from "@/lib/utils";

interface PlaytimeAuditLegacyZeradosProps {
  report: LegacyZeradosAuditReport;
}

interface GameGroup {
  gameId: string;
  gameTitle: string;
  players: LegacyZeradoAuditRow[];
  pendingCount: number;
}

const sourceLabel: Record<LegacyZeradoSource, string> = {
  jogatina: "Jogatina",
  season: "Temporada",
  ambos: "Jogatina + temporada",
};

const statusLabel: Record<LegacyZeradoMigrationStatus, string> = {
  pendente: "Pendente",
  ja_migrado: "Já na lista nova",
  bloqueado_platinagem: "Platinagem",
};

function StatusBadge({ status }: { status: LegacyZeradoMigrationStatus }) {
  if (status === "ja_migrado") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
        {statusLabel[status]}
      </Badge>
    );
  }

  if (status === "bloqueado_platinagem") {
    return (
      <Badge className="bg-amber-500/15 text-amber-300 hover:bg-amber-500/15">
        {statusLabel[status]}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-white/15 text-muted-foreground">
      {statusLabel[status]}
    </Badge>
  );
}

function groupRowsByGame(rows: LegacyZeradoAuditRow[]): GameGroup[] {
  const map = new Map<string, GameGroup>();

  for (const row of rows) {
    const existing = map.get(row.gameId);
    if (existing) {
      existing.players.push(row);
      if (row.migrationStatus === "pendente") existing.pendingCount += 1;
      continue;
    }

    map.set(row.gameId, {
      gameId: row.gameId,
      gameTitle: row.gameTitle,
      players: [row],
      pendingCount: row.migrationStatus === "pendente" ? 1 : 0,
    });
  }

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      players: [...group.players].sort((a, b) =>
        a.playerName.localeCompare(b.playerName, "pt-BR"),
      ),
    }))
    .sort((a, b) => {
      if (b.players.length !== a.players.length) {
        return b.players.length - a.players.length;
      }
      return a.gameTitle.localeCompare(b.gameTitle, "pt-BR");
    });
}

function SummaryCards({
  summary,
  gameCount,
}: {
  summary: LegacyZeradosAuditReport["summary"];
  gameCount: number;
}) {
  const items = [
    { label: "Jogos", value: gameCount },
    { label: "Pares jogador+jogo", value: summary.totalPairs },
    { label: "Pendentes", value: summary.pending },
    { label: "Já migrados", value: summary.alreadyMigrated },
    { label: "Bloqueados (platina)", value: summary.blockedByPlatinum },
    { label: "Só temporada", value: summary.fromSeasonOnly },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className={cn(glassSubtle, "px-3 py-2")}>
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
          <p className="text-lg font-bold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function LegacyZeradosGroupedList({ rows }: { rows: LegacyZeradoAuditRow[] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum status <code className="text-xs">Zero</code> encontrado em
        jogatinas ou temporadas (apps excluídos).
      </p>
    );
  }

  const groups = groupRowsByGame(rows);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div
          key={group.gameId}
          className="overflow-hidden rounded-lg border border-border/60"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {group.gameTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                {group.players.length}{" "}
                {group.players.length === 1 ? "jogador" : "jogadores"}
                {group.pendingCount > 0
                  ? ` · ${group.pendingCount} pendente${group.pendingCount === 1 ? "" : "s"}`
                  : ""}
              </p>
            </div>
            <LegacyZeradoMigrateAllButton
              gameTitle={group.gameTitle}
              pendingPlayers={group.players
                .filter((player) => player.migrationStatus === "pendente")
                .map((player) => ({
                  playerId: player.playerId,
                  playerName: player.playerName,
                }))}
              gameId={group.gameId}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/15 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Jogador</th>
                  <th className="px-4 py-2.5 font-medium">Origem</th>
                  <th className="px-4 py-2.5 font-medium">Ocorrências</th>
                  <th className="px-4 py-2.5 font-medium">Migração</th>
                  <th className="px-4 py-2.5 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {group.players.map((row) => (
                  <tr
                    key={`${row.playerId}-${row.gameId}`}
                    className="border-t border-border/40"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/dashboard/jogadores/${row.playerId}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {row.playerName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="border-white/10">
                        {sourceLabel[row.source]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
                      {row.jogatinaCount > 0 && (
                        <span>
                          {row.jogatinaCount} jogatina
                          {row.jogatinaCount === 1 ? "" : "s"}
                        </span>
                      )}
                      {row.jogatinaCount > 0 && row.seasonCount > 0 && " · "}
                      {row.seasonCount > 0 && (
                        <span>
                          {row.seasonCount} temporada
                          {row.seasonCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={row.migrationStatus} />
                    </td>
                    <td className="px-4 py-2.5">
                      <LegacyZeradoMigrateButton
                        playerId={row.playerId}
                        gameId={row.gameId}
                        playerName={row.playerName}
                        gameTitle={row.gameTitle}
                        migrationStatus={row.migrationStatus}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlaytimeAuditLegacyZerados({
  report,
}: PlaytimeAuditLegacyZeradosProps) {
  const gameCount = new Set(report.rows.map((row) => row.gameId)).size;

  return (
    <DashboardPanel>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Agrupado por jogo: jogadores com status{" "}
          <code className="text-xs">Zero</code> no sistema antigo
          (jogatina/temporada). Use para decidir o que migrar para{" "}
          <code className="text-xs">player_zerado_games</code>.
        </p>
        <SummaryCards summary={report.summary} gameCount={gameCount} />
        <LegacyZeradosGroupedList rows={report.rows} />
      </div>
    </DashboardPanel>
  );
}
