import type { PlaytimeAuditDiagnostics } from "@/lib/playtime-audit";
import { glassSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface PlaytimeAuditDiagnosticsProps {
  diagnostics: PlaytimeAuditDiagnostics;
}

const diagnosticItems: {
  key: keyof PlaytimeAuditDiagnostics;
  label: string;
  hint: string;
}[] = [
  {
    key: "jogatinasFetched",
    label: "Linhas buscadas",
    hint: "Total retornado do banco na varredura completa",
  },
  {
    key: "uniqueJogatinas",
    label: "IDs únicos",
    hint: "Deve ser igual às linhas buscadas se não houver duplicata",
  },
  {
    key: "finishedSessions",
    label: "Sessões finalizadas",
    hint: "is_current = false",
  },
  {
    key: "activeSessions",
    label: "Sessões ativas",
    hint: "Não entram no total da landing",
  },
  {
    key: "missingGameLink",
    label: "Sem jogo linkado",
    hint: "Excluídas do total da landing",
  },
  {
    key: "finishedNullDuration",
    label: "Finalizadas sem duração",
    hint: "total_duration_minutes null",
  },
  {
    key: "finishedZeroDuration",
    label: "Finalizadas com 0 min",
    hint: "Não somam no total",
  },
  {
    key: "finishedWithDuration",
    label: "Contabilizadas",
    hint: "Finalizadas com duração > 0 e jogo válido",
  },
  {
    key: "duplicateIdsSkipped",
    label: "Duplicatas ignoradas",
    hint: "Deve ser 0",
  },
];

export function PlaytimeAuditDiagnostics({
  diagnostics,
}: PlaytimeAuditDiagnosticsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {diagnosticItems.map((item) => {
        const value = diagnostics[item.key];
        const isWarning =
          (item.key === "duplicateIdsSkipped" && value > 0) ||
          (item.key === "missingGameLink" && value > 0) ||
          (item.key === "finishedNullDuration" && value > 0);

        return (
          <div
            key={item.key}
            className={cn(glassSubtle, "px-4 py-3")}
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                isWarning ? "text-amber-400" : "text-foreground"
              }`}
            >
              {value}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground/80">
              {item.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
