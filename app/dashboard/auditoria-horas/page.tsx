import { PlaytimeAuditPanel } from "@/components/dashboard/playtime-audit/playtime-audit-panel";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
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
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Validação"
        title="Auditoria de horas"
        description="Recalcula o histórico do grupo de formas independentes para confirmar se os números da landing estão corretos, e mostra jogatinas/jogadores ainda ativos no banco para debug."
      />

      <PlaytimeAuditPanel report={report} liveState={liveState} />
    </div>
  );
}
