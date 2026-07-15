import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { glassSubtle } from "@/lib/glass-styles";
import { PlaytimeAuditDiagnostics } from "@/components/dashboard/playtime-audit/playtime-audit-diagnostics";
import { PlaytimeAuditLegacyZerados } from "@/components/dashboard/playtime-audit/playtime-audit-legacy-zerados";
import { PlaytimeAuditLiveState } from "@/components/dashboard/playtime-audit/playtime-audit-live-state";
import { PlaytimeAuditMethods } from "@/components/dashboard/playtime-audit/playtime-audit-methods";
import { PlaytimeAuditOutliers } from "@/components/dashboard/playtime-audit/playtime-audit-outliers";
import { Badge } from "@/components/ui/badge";
import type { LegacyZeradosAuditReport } from "@/lib/legacy-zerados-audit";
import type { LiveStateAuditReport } from "@/lib/live-state-audit";
import type { PlaytimeAuditReport } from "@/lib/playtime-audit";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaytimeAuditPanelProps {
  report: PlaytimeAuditReport;
  liveState: LiveStateAuditReport;
  legacyZerados: LegacyZeradosAuditReport;
}

function formatGeneratedAt(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function PlaytimeAuditPanel({
  report,
  liveState,
  legacyZerados,
}: PlaytimeAuditPanelProps) {
  const landing = report.methods.find((method) => method.id === "landing");
  const independent = report.methods.find(
    (method) => method.id === "independent",
  );

  return (
    <div className="space-y-8">
      <DashboardPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {report.landingMatchesIndependent ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Landing confere com varredura
                </Badge>
              ) : report.landingMinutesMatch ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Horas conferem · ajuste fino de sessões
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  Landing divergente da varredura
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Gerado em {formatGeneratedAt(report.generatedAt)}. Se{" "}
              <strong>Jogos</strong> e <strong>Apps</strong> batem entre landing e
              varredura, o número da home está correto.
            </p>
          </div>

          {landing && independent && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={cn(glassSubtle, "px-3 py-2")}>
                <p className="text-xs text-muted-foreground">Landing · Jogos</p>
                <p className="text-lg font-bold tabular-nums">
                  {landing.hours.gameHours}h
                </p>
              </div>
              <div className={cn(glassSubtle, "px-3 py-2")}>
                <p className="text-xs text-muted-foreground">Varredura · Jogos</p>
                <p className="text-lg font-bold tabular-nums">
                  {independent.hours.gameHours}h
                </p>
              </div>
              <div className={cn(glassSubtle, "px-3 py-2")}>
                <p className="text-xs text-muted-foreground">Landing · Apps</p>
                <p className="text-lg font-bold tabular-nums">
                  {landing.hours.appHours}h
                </p>
              </div>
              <div className={cn(glassSubtle, "px-3 py-2")}>
                <p className="text-xs text-muted-foreground">Varredura · Apps</p>
                <p className="text-lg font-bold tabular-nums">
                  {independent.hours.appHours}h
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardPanel>

      <DashboardSection
        title="Estado ao vivo"
        description="Lista jogatinas e jogadores ainda marcados como ativos no banco. Ajuda a achar sessão presa quando o bot caiu."
      >
        <PlaytimeAuditLiveState report={liveState} />
      </DashboardSection>

      <DashboardSection
        title="Zeros do sistema antigo"
        description="Jogos marcados como Zero em jogatinas ou temporadas. Serve para decidir o que migrar para a lista curada de zerados do perfil."
      >
        <PlaytimeAuditLegacyZerados report={legacyZerados} />
      </DashboardSection>

      <DashboardSection
        title="Comparação de métodos"
        description="Landing e varredura independente devem bater. A soma por jogador serve só como referência em sessões de grupo."
      >
        <PlaytimeAuditMethods
          methods={report.methods}
          landingMatchesIndependent={report.landingMatchesIndependent}
          landingMinutesMatch={report.landingMinutesMatch}
        />
      </DashboardSection>

      <DashboardSection
        title="Diagnóstico da base"
        description="Mostra o que foi buscado, o que entrou na conta e o que ficou de fora."
      >
        <PlaytimeAuditDiagnostics diagnostics={report.diagnostics} />
      </DashboardSection>

      <DashboardSection
        title="Maiores sessões"
        description="Sessões finalizadas com mais tempo registrado, da maior para a menor."
      >
        <PlaytimeAuditOutliers
          outliers={report.outliers}
          referenceTotals={
            independent?.totals ?? {
              gameMinutes: 0,
              appMinutes: 0,
              sessionCount: 0,
            }
          }
        />
      </DashboardSection>
    </div>
  );
}
