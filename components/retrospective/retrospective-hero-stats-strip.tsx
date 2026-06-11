import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Calendar, Clock, Gamepad2, Users } from "lucide-react";
import type { Game } from "@/lib/types";
import type { YearSummary } from "@/lib/retrospective-helpers";

interface RetrospectiveHeroStatsStripProps {
  summary: YearSummary;
  emptyCopy: string;
}

interface StatItemProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  spotlight?: Game | null;
}

function StatItem({ label, value, hint, icon: Icon, spotlight }: StatItemProps) {
  return (
    <div className="flex min-h-[100px] flex-col justify-between gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
          {value}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        {spotlight && (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative h-8 w-6 shrink-0 overflow-hidden rounded bg-muted ring-1 ring-border/50">
              {spotlight.cover_url ? (
                <Image
                  src={spotlight.cover_url}
                  alt=""
                  fill
                  sizes="24px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Gamepad2 className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="truncate text-[11px] text-foreground/65">
              {spotlight.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function RetrospectiveHeroStatsStrip({
  summary,
  emptyCopy,
}: RetrospectiveHeroStatsStripProps) {
  const isEmpty = summary.totalSessions === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <StatItem
          label="Jogatinas"
          value={String(summary.totalSessions)}
          hint={isEmpty ? emptyCopy : "Sessões com 2+ jogadores"}
          icon={Users}
          spotlight={summary.spotlightSessions}
        />
        <StatItem
          label="Tempo jogado"
          value={summary.totalHoursLabel}
          hint={isEmpty ? emptyCopy : "Em sessões de grupo"}
          icon={Clock}
          spotlight={summary.spotlightPlaytime}
        />
        <StatItem
          label="Jogos únicos"
          value={String(summary.uniqueGames)}
          hint={isEmpty ? emptyCopy : "Títulos diferentes no ano"}
          icon={Gamepad2}
          spotlight={summary.spotlightVariety}
        />
        <StatItem
          label="Mês mais ativo"
          value={summary.busiestMonth?.monthName ?? "—"}
          hint={
            summary.busiestMonth
              ? `${summary.busiestMonth.sessionCount} jogatinas`
              : emptyCopy
          }
          icon={Calendar}
          spotlight={summary.spotlightBusiestMonth}
        />
      </div>
    </div>
  );
}
