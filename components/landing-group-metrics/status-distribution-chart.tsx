"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { cn } from "@/lib/utils"
import type { GroupMetricsData } from "@/components/landing-group-metrics/metrics-data"

interface StatusDistributionChartProps {
  pieData: GroupMetricsData["pieData"]
  total: number
  dropRate: string
}

function ChartTooltip({
  active,
  payload,
  total,
}: TooltipProps<number, string> & { total: number }) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0].payload as GroupMetricsData["pieData"][number]
  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"

  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-foreground">{item.name}</p>
      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
        {item.value} participações ({percentage}%)
      </p>
    </div>
  )
}

export function StatusDistributionChart({
  pieData,
  total,
  dropRate,
}: StatusDistributionChartProps) {
  if (pieData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
        Sem dados de status ainda
      </div>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={92}
            paddingAngle={3}
            dataKey="value"
            stroke="transparent"
          >
            {pieData.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            content={(props: TooltipProps<number, string>) => (
              <ChartTooltip {...props} total={total} />
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold tabular-nums tracking-tight">
          {dropRate}%
        </p>
        <p className="text-[11px] text-muted-foreground">taxa de drop</p>
      </div>
    </div>
  )
}

interface StatusLegendProps {
  items: GroupMetricsData["legendItems"]
}

export function StatusLegend({ items }: StatusLegendProps) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/20"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
              aria-hidden
            />
            <span className="truncate text-sm text-foreground">{item.label}</span>
          </div>

          <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
            <span
              className={cn("text-sm font-semibold", item.valueClassName)}
            >
              {item.value}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
