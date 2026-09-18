import { LandingGlassCell, LandingMetric } from "@/components/landing/landing-glass-cell"
import {
  formatWeeklyChange,
  formatWeeklyDuration,
  type WeeklySummary,
} from "@/lib/landing-weekly-summary-helpers"

export function LandingWeeklySummary({ summary }: { summary: WeeklySummary }) {
  const sessionMeta =
    summary.sessionsChange === 0
      ? "igual à semana passada"
      : `${Math.abs(summary.sessionsChange)} ${summary.sessionsChange > 0 ? "a mais" : "a menos"}`

  return (
    <LandingGlassCell innerClassName="p-5 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.75fr))] sm:items-end sm:gap-5">
        <LandingMetric
          label="Tempo jogado"
          value={<span className="block truncate">{formatWeeklyDuration(summary.totalMinutes)}</span>}
          valueClassName="text-3xl leading-none sm:text-4xl"
          meta={formatWeeklyChange(summary.minutesChange)}
        />
        <LandingMetric
          label="Sessões"
          value={summary.sessionsCount}
          valueClassName="text-3xl leading-none sm:text-4xl"
          meta={sessionMeta}
        />
        <LandingMetric
          label="Dias jogados"
          value={summary.activeDays}
          valueClassName="text-3xl leading-none sm:text-4xl"
          meta={summary.activeDays === 1 ? "dia com jogatina" : "dias com jogatina"}
        />
      </div>
    </LandingGlassCell>
  )
}
