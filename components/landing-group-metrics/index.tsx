"use client"

import {
  Award,
  Calendar,
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
import {
  LandingEmptyState,
  LandingGlassCell,
  LandingMetric,
} from "@/components/landing/landing-glass-cell"

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
      <LandingEmptyState>
        Ainda não há participações registradas.
      </LandingEmptyState>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        <LandingGlassCell className="lg:col-span-2">
          <LandingMetric
            label="Duração média por participação"
            value={
              <span className="text-[clamp(2rem,8cqi,3rem)] leading-none">
                {avgDuration}
                <span className="ml-1.5 text-xl font-medium text-muted-foreground">
                  min
                </span>
              </span>
            }
            meta={`${total.toLocaleString("pt-BR")} registros no grupo`}
          />
        </LandingGlassCell>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <LandingGlassCell>
            <LandingMetric
              label="Taxa de drop"
              value={<span className="text-3xl text-destructive">{dropRate}%</span>}
            />
          </LandingGlassCell>
          <LandingGlassCell>
            <LandingMetric
              label="Participações"
              value={
                <span className="text-3xl">{total.toLocaleString("pt-BR")}</span>
              }
            />
          </LandingGlassCell>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <LandingGlassCell className="lg:col-span-7" innerClassName="p-0">
          <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
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
        </LandingGlassCell>

        <LandingGlassCell className="lg:col-span-5" innerClassName="grid grid-cols-2 gap-px divide-white/[0.06] p-0">
          <MetricStatTile
            label="Jogatinas"
            value={statusCounts.jogatina.toLocaleString("pt-BR")}
            hint="Participou até o fim"
            icon={Calendar}
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
          />
          <MetricStatTile
            label="Dava pra jogar"
            value={statusCounts.davaJogar.toLocaleString("pt-BR")}
            hint="Parou, mas dava"
            icon={Target}
          />
        </LandingGlassCell>
      </div>
    </div>
  )
}
