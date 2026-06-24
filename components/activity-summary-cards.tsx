"use client"

import { Calendar, TrendingUp, Clock } from "lucide-react"
import type { Jogatina, Game } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActivitySummaryCardsProps {
  jogatinas: (Jogatina & { game: Game })[]
  className?: string
  variant?: "sidebar" | "inline"
}

interface SummaryStat {
  icon: React.ReactNode
  value: string
  label: string
}

interface SummaryRowProps {
  icon: React.ReactNode
  value: string
  label: string
  compact?: boolean
}

function SummaryRow({ icon, value, label, compact }: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        compact ? "flex-col items-start gap-1.5 p-2" : "py-3.5 first:pt-0 last:pb-0",
      )}
    >
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold tabular-nums text-foreground",
            compact ? "text-sm" : "text-base",
          )}
        >
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function buildSummaryStats(
  jogatinas: (Jogatina & { game: Game })[],
): SummaryStat[] {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)
  startDate.setHours(0, 0, 0, 0)

  const filteredJogatinas = jogatinas.filter((j) => {
    const jogatinaDate = new Date(j.date)
    return jogatinaDate >= startDate && jogatinaDate <= endDate
  })

  const monthCounts = new Map<string, number>()

  filteredJogatinas.forEach((j) => {
    const jogatinaDate = new Date(j.date)
    const monthKey = `${jogatinaDate.getFullYear()}-${jogatinaDate.getMonth()}`
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1)
  })

  let maxMonth = ""
  let maxCount = 0

  monthCounts.forEach((count, monthKey) => {
    if (count > maxCount) {
      maxCount = count
      maxMonth = monthKey
    }
  })

  let mostActiveMonth = "Nenhum"
  if (maxMonth) {
    const [year, month] = maxMonth.split("-")
    const date = new Date(parseInt(year), parseInt(month), 1)
    mostActiveMonth = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  const totalWeeks = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
    ),
  )
  const averagePerWeek = (filteredJogatinas.length / totalWeeks).toFixed(1)

  let longestSession = 0

  filteredJogatinas.forEach((j) => {
    const duration = j.total_duration_minutes || 0
    if (duration > longestSession) {
      longestSession = duration
    }
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  return [
    {
      icon: <Calendar className="h-4 w-4" strokeWidth={1.75} />,
      value: mostActiveMonth,
      label: "Mês mais ativo",
    },
    {
      icon: <TrendingUp className="h-4 w-4" strokeWidth={1.75} />,
      value: `${averagePerWeek}/sem`,
      label: "Média semanal",
    },
    {
      icon: <Clock className="h-4 w-4" strokeWidth={1.75} />,
      value: formatDuration(longestSession),
      label: "Maior sessão",
    },
  ]
}

export function ActivitySummaryCards({
  jogatinas,
  className,
  variant = "sidebar",
}: ActivitySummaryCardsProps) {
  const stats = buildSummaryStats(jogatinas)

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] sm:gap-3",
          className,
        )}
      >
        {stats.map((stat) => (
          <SummaryRow
            key={stat.label}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            compact
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("divide-y divide-white/[0.06]", className)}>
      {stats.map((stat) => (
        <SummaryRow
          key={stat.label}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
        />
      ))}
    </div>
  )
}
