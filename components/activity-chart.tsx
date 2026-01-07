"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { Jogatina, Game } from "@/lib/types"

interface ActivityChartProps {
  jogatinas: (Jogatina & { game: Game })[]
}

const chartConfig = {
  jogatinas: {
    label: "Jogatinas",
    color: "var(--sidebar-primary)",
  },
} satisfies ChartConfig

export function ActivityChart({ jogatinas }: ActivityChartProps) {
  // Group by month-year and count
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

  // Convert to array, sort by date, and take last 6 months
  const chartData = Array.from(monthlyDataMap.entries())
    .map(([key, { count, date }]) => ({
      key,
      date,
      month: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
      jogatinas: count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6) // Last 6 months
    .map(({ month, jogatinas }) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      jogatinas,
    }))

  if (chartData.length === 0) {
    return (
      <Card className="relative group">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhuma jogatina registrada ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative group">
      {/* Decorative corner lines */}
      <div className="absolute top-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader>
        <CardTitle>Jogatinas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toString()}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="jogatinas"
              fill="oklch(0.546 0.245 262.881)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
