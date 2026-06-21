import type { JogatinaPlayer } from "@/lib/types"

export const STATUS_ITEMS = [
  {
    key: "jogatina",
    label: "Jogatina",
    status: "Jogatina",
    fill: "var(--chart-4)",
    valueClassName: "text-primary",
  },
  {
    key: "dropo",
    label: "Dropo",
    status: "Dropo",
    fill: "var(--destructive)",
    valueClassName: "text-destructive",
  },
  {
    key: "zero",
    label: "Zero",
    status: "Zero",
    fill: "oklch(0.723 0.191 142.542)",
    valueClassName: "text-emerald-500",
  },
  {
    key: "davaJogar",
    label: "Dava pra jogar",
    status: "Dava pra jogar",
    fill: "oklch(0.795 0.184 86.047)",
    valueClassName: "text-amber-500",
  },
] as const

export interface GroupMetricsData {
  statusCounts: Record<(typeof STATUS_ITEMS)[number]["key"], number>
  total: number
  dropRate: string
  avgDuration: number
  pieData: { name: string; value: number; fill: string; key: string }[]
  legendItems: {
    key: string
    label: string
    value: number
    fill: string
    percentage: number
    valueClassName: string
  }[]
}

export function buildGroupMetricsData(
  jogatinaPlayers: JogatinaPlayer[],
): GroupMetricsData {
  const statusCounts = {
    jogatina: jogatinaPlayers.filter((jp) => jp.status === "Jogatina").length,
    dropo: jogatinaPlayers.filter((jp) => jp.status === "Dropo").length,
    zero: jogatinaPlayers.filter((jp) => jp.status === "Zero").length,
    davaJogar: jogatinaPlayers.filter((jp) => jp.status === "Dava pra jogar")
      .length,
  }

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  const dropRate = total > 0 ? ((statusCounts.dropo / total) * 100).toFixed(1) : "0"

  const avgDuration =
    jogatinaPlayers.length > 0
      ? Math.round(
          jogatinaPlayers.reduce(
            (acc, jp) => acc + (jp.total_duration_minutes || 0),
            0,
          ) / jogatinaPlayers.length,
        )
      : 0

  const legendItems = STATUS_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    value: statusCounts[item.key],
    fill: item.fill,
    percentage: total > 0 ? (statusCounts[item.key] / total) * 100 : 0,
    valueClassName: item.valueClassName,
  }))

  const pieData = legendItems
    .filter((item) => item.value > 0)
    .map((item) => ({
      name: item.label,
      value: item.value,
      fill: item.fill,
      key: item.key,
    }))

  return {
    statusCounts,
    total,
    dropRate,
    avgDuration,
    pieData,
    legendItems,
  }
}
