"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { Jogatina, Game } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActivityChartProps {
  jogatinas: (Jogatina & { game: Game })[]
  compact?: boolean
  borderless?: boolean
  className?: string
}

const chartConfig = {
  jogatinas: {
    label: "Jogatinas",
    color: "var(--sidebar-primary)",
  },
} satisfies ChartConfig

export function ActivityChart({
  jogatinas,
  compact = false,
  borderless = false,
  className,
}: ActivityChartProps) {
  const monthlyDataMap = new Map<string, { count: number; date: Date }>()

  jogatinas.forEach((jogatina) => {
    const date = new Date(jogatina.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${month.toString().padStart(2, "0")}`

    if (!monthlyDataMap.has(key)) {
      monthlyDataMap.set(key, { count: 0, date })
    }
    monthlyDataMap.get(key)!.count++
  })

  const chartData = Array.from(monthlyDataMap.entries())
    .map(([key, { count, date }]) => ({
      key,
      date,
      month: date.toLocaleDateString("pt-BR", { month: "short" }),
      jogatinas: count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6)
    .map(({ month, jogatinas: count }) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      jogatinas: count,
    }))

  const cardClassName = cn(
    borderless ? "border-0 bg-transparent shadow-none" : "border-border/50 bg-card/30",
    className,
  )

  if (chartData.length === 0) {
    return (
      <Card className={cardClassName}>
        <CardContent className={cn(compact ? "py-8" : "pt-6")}>
          <p className="text-center text-sm text-muted-foreground">
            Nenhuma jogatina registrada ainda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardClassName}>
      <CardContent className={cn(compact ? "px-4 py-4 sm:px-5" : "pt-6")}>
        <ChartContainer
          config={chartConfig}
          className={cn(
            "w-full",
            compact ? "h-[140px]" : "min-h-[240px]",
          )}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={
              compact
                ? { top: 4, right: 4, bottom: 0, left: -20 }
                : { top: 12, right: 12, bottom: 12, left: 12 }
            }
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border/40"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={compact ? 6 : 8}
              tick={{ fontSize: compact ? 11 : 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={compact ? 28 : 36}
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="jogatinas"
              fill="var(--color-jogatinas)"
              radius={[3, 3, 0, 0]}
              maxBarSize={compact ? 32 : 48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
