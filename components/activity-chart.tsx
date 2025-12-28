"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { Jogatina, Game } from "@/lib/types"

interface ActivityChartProps {
  jogatinas: (Jogatina & { game: Game })[]
}

export function ActivityChart({ jogatinas }: ActivityChartProps) {
  const monthlyData = jogatinas.reduce(
    (acc, jogatina) => {
      const date = new Date(jogatina.date)
      const monthYear = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })

      if (!acc[monthYear]) {
        acc[monthYear] = 0
      }
      acc[monthYear]++

      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(monthlyData)
    .map(([month, count]) => ({
      month,
      jogatinas: count,
    }))
    .slice(-6) // Last 6 months

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhuma jogatina registrada ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogatinas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="jogatinas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
