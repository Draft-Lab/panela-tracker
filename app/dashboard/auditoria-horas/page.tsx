import { PlaytimeAuditPanel } from "@/components/dashboard/playtime-audit/playtime-audit-panel";
import { buildLiveStateAuditReport } from "@/lib/live-state-audit";
import { buildPlaytimeAuditReport } from "@/lib/playtime-audit";
import { createClient } from "@/lib/supabase/server";

export default async function PlaytimeAuditPage() {
  const supabase = await createClient();
  const [report, liveState] = await Promise.all([
    buildPlaytimeAuditReport(supabase),
    buildLiveStateAuditReport(supabase),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Validação</p>
        <h1 className="text-3xl font-bold tracking-tight">Auditoria de horas</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Esta página recalcula o histórico do grupo de formas independentes
          para confirmar se os números da landing estão corretos, e também
          mostra jogatinas/jogadores ainda ativos no banco para debug.
        </p>
      </header>

      <PlaytimeAuditPanel report={report} liveState={liveState} />
    </div>
  );
}
