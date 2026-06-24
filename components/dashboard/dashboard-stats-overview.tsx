import type { LucideIcon } from "lucide-react";
import {
  Award,
  Calendar,
  Gamepad2,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { glassDivider } from "@/lib/glass-styles";

interface DashboardStatsOverviewProps {
  totalPlayers: number;
  totalGames: number;
  totalJogatinas: number;
  totalParticipations: number;
  dropRate: string;
  dropCount: number;
  zeroCount: number;
  davaCount: number;
}

interface StatCellProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  valueClassName?: string;
}

function StatCell({
  label,
  value,
  hint,
  icon: Icon,
  valueClassName,
}: StatCellProps) {
  return (
    <div className="flex min-h-[88px] flex-col justify-between gap-2 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
      </div>
      <div>
        <p
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight sm:text-3xl",
            valueClassName,
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function DashboardStatsOverview({
  totalPlayers,
  totalGames,
  totalJogatinas,
  totalParticipations,
  dropRate,
  dropCount,
  zeroCount,
  davaCount,
}: DashboardStatsOverviewProps) {
  const avgPlayers =
    totalJogatinas > 0
      ? (totalParticipations / totalJogatinas).toFixed(1)
      : "0";

  return (
    <DashboardPanel innerClassName={cn("overflow-hidden p-0", glassDivider)}>
      <div className="grid grid-cols-2 divide-y divide-white/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <StatCell
          label="Jogadores"
          value={String(totalPlayers)}
          hint="Perfis cadastrados"
          icon={Users}
        />
        <StatCell
          label="Jogos"
          value={String(totalGames)}
          hint="No catálogo"
          icon={Gamepad2}
        />
        <StatCell
          label="Jogatinas"
          value={String(totalJogatinas)}
          hint="Sessões registradas"
          icon={Calendar}
        />
        <StatCell
          label="Participações"
          value={String(totalParticipations)}
          hint="Total no grupo"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-2 divide-y divide-white/[0.06] border-t border-white/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <StatCell
          label="Taxa de drop"
          value={`${dropRate}%`}
          hint={`${dropCount} drops`}
          icon={TrendingDown}
          valueClassName="text-destructive"
        />
        <StatCell
          label="Zerados"
          value={String(zeroCount)}
          hint="Completados"
          icon={Award}
          valueClassName="text-success"
        />
        <StatCell
          label="Dava pra jogar"
          value={String(davaCount)}
          hint="Poderiam continuar"
          icon={Target}
          valueClassName="text-warning"
        />
        <StatCell
          label="Média / sessão"
          value={avgPlayers}
          hint="Jogadores por jogatina"
          icon={Users}
        />
      </div>
    </DashboardPanel>
  );
}
