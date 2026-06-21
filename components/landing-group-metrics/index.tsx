"use client"

import {
  Award,
  Calendar,
  Clock,
  Target,
  TrendingDown,
} from "lucide-react"
import type { JogatinaPlayer, SeasonParticipant } from "@/lib/types"
import { buildGroupMetricsData } from "@/components/landing-group-metrics/metrics-data"
import { MetricStatTile } from "@/components/landing-group-metrics/metric-stat-tile"
import {
  StatusDistributionChart,
  StatusLegend,
} from "@/components/landing-group-metrics/status-distribution-chart"

interface LandingGroupMetricsProps {
  jogatinaPlayers: JogatinaPlayer[]
  seasonParticipants: SeasonParticipant[]
}

export function LandingGroupMetrics({
  jogatinaPlayers,
}: LandingGroupMetricsProps) {
  const metrics = buildGroupMetricsData(jogatinaPlayers)
  const { statusCounts, total, dropRate, avgDuration, pieData, legendItems } =
    metrics

  if (total === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
        Ainda não há participações registradas.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/8 via-card/40 to-background">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium">Duração média</span>
            </div>
            <p className="mt-3 text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
              {avgDuration}
              <span className="ml-1.5 text-2xl font-semibold text-muted-foreground sm:text-3xl">
                min
              </span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Tempo médio por participação em {total.toLocaleString("pt-BR")}{" "}
              registros do grupo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:justify-end">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Taxa de drop
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">
                {dropRate}%
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Participações
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {total.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-border/50 bg-card/30 lg:col-span-7">
          <div className="border-b border-border/50 px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-foreground">
              Distribuição de status
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Como cada membro terminou as participações registradas.
            </p>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
            <StatusDistributionChart
              pieData={pieData}
              total={total}
              dropRate={dropRate}
            />
            <StatusLegend items={legendItems} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border/50 bg-border/40 lg:col-span-5">
          <div className="grid grid-cols-2 gap-px">
            <MetricStatTile
              label="Jogatinas"
              value={statusCounts.jogatina.toLocaleString("pt-BR")}
              hint="Participou até o fim"
              icon={Calendar}
              valueClassName="text-primary"
            />
            <MetricStatTile
              label="Drops"
              value={statusCounts.dropo.toLocaleString("pt-BR")}
              hint="Abandonou a sessão"
              icon={TrendingDown}
              valueClassName="text-destructive"
            />
            <MetricStatTile
              label="Zerados"
              value={statusCounts.zero.toLocaleString("pt-BR")}
              hint="Completou o jogo"
              icon={Award}
              valueClassName="text-emerald-500"
            />
            <MetricStatTile
              label="Dava pra jogar"
              value={statusCounts.davaJogar.toLocaleString("pt-BR")}
              hint="Parou, mas dava"
              icon={Target}
              valueClassName="text-amber-500"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
