import { cn } from "@/lib/utils"
import type { GroupMetricsData } from "./metrics-data"

interface StatusDistributionChartProps {
  pieData: GroupMetricsData["pieData"]
  total: number
  dropRate: string
}

export function StatusDistributionChart({ pieData, total, dropRate }: StatusDistributionChartProps) {
  if (!total) return <p className="p-8 text-sm text-muted-foreground">Sem dados de status ainda</p>
  let cursor = 0
  const segments = pieData.map(item => {
    const start = cursor
    cursor += (item.value / total) * 100
    return `${item.fill} ${start}% ${cursor}%`
  }).join(", ")
  const description = pieData.map(item => `${item.name}: ${item.value} participações, ${((item.value / total) * 100).toFixed(1)}%`).join(". ")
  return <div className="relative mx-auto flex h-[220px] w-full max-w-[280px] items-center justify-center">
    <div role="img" aria-label={`Distribuição de status. ${description}`} title={description}
      className="size-[184px] rounded-full" style={{ background: `conic-gradient(${segments})` }} />
    <div className="pointer-events-none absolute flex size-[136px] flex-col items-center justify-center rounded-full bg-card">
      <p className="text-2xl font-bold tabular-nums tracking-tight">{dropRate}%</p>
      <p className="text-[11px] text-muted-foreground">taxa de drop</p>
    </div>
  </div>
}

export function StatusLegend({ items }: { items: GroupMetricsData["legendItems"] }) {
  return <ul className="mt-5 space-y-2.5">
    {items.map(item => <li key={item.key} title={`${item.value} participações (${item.percentage.toFixed(1)}%)`}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/20">
      <div className="flex min-w-0 items-center gap-2.5"><span className="size-2.5 shrink-0 rounded-full" style={{backgroundColor:item.fill}} aria-hidden />
        <span className="truncate text-sm text-foreground">{item.label}</span></div>
      <div className="flex shrink-0 items-baseline gap-2 tabular-nums"><span className={cn("text-sm font-semibold",item.valueClassName)}>{item.value}</span>
        <span className="text-xs text-muted-foreground">{item.percentage.toFixed(0)}%</span></div>
    </li>)}
  </ul>
}
