import type { LucideIcon } from "lucide-react"
import { Calendar, Clock, Trophy, Users } from "lucide-react"
import { DashboardPanel } from "@/components/dashboard/dashboard-panel"
import { LandingMetric } from "@/components/landing/landing-glass-cell"
import { glassDivider } from "@/lib/glass-styles"
import { cn } from "@/lib/utils"

interface SeasonDetailMetricsProps {
  durationDays: number
  participantCount: number
  totalSessions: number
  totalHours: number
}

function MetricCell({
  label,
  value,
  meta,
  icon: Icon,
}: {
  label: string
  value: string
  meta: string
  icon: LucideIcon
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
      </div>
      <LandingMetric label={label} value={value} meta={meta} />
    </div>
  )
}

export function SeasonDetailMetrics({
  durationDays,
  participantCount,
  totalSessions,
  totalHours,
}: SeasonDetailMetricsProps) {
  return (
    <DashboardPanel innerClassName={cn("overflow-hidden p-0", glassDivider)}>
      <div className="grid grid-cols-2 divide-y divide-white/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <MetricCell
          label="Duração"
          value={String(durationDays)}
          meta={durationDays === 1 ? "dia" : "dias"}
          icon={Calendar}
        />
        <MetricCell
          label="Participantes"
          value={String(participantCount)}
          meta="jogadores"
          icon={Users}
        />
        <MetricCell
          label="Sessões"
          value={String(totalSessions)}
          meta="jogatinas realizadas"
          icon={Trophy}
        />
        <MetricCell
          label="Tempo total"
          value={`${totalHours}h`}
          meta="jogadas"
          icon={Clock}
        />
      </div>
    </DashboardPanel>
  )
}
