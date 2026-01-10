"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import type { Jogatina, Game } from "@/lib/types"
import { useState } from "react"

interface ActivityHeatmapProps {
  jogatinas: (Jogatina & { game: Game })[]
}

interface DayData {
  date: Date
  count: number
  totalMinutes: number
}

export function ActivityHeatmap({ jogatinas }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Calcular período (últimos 12 meses)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)

  // Agrupar jogatinas por dia
  const dayDataMap = new Map<string, DayData>()
  
  jogatinas.forEach((jogatina) => {
    const date = new Date(jogatina.date)
    if (date >= startDate && date <= endDate) {
      const key = date.toISOString().split('T')[0]
      
      if (!dayDataMap.has(key)) {
        dayDataMap.set(key, {
          date: new Date(key),
          count: 0,
          totalMinutes: 0,
        })
      }
      
      const dayData = dayDataMap.get(key)!
      dayData.count++
      dayData.totalMinutes += jogatina.total_duration_minutes || 0
    }
  })

  // Criar array de todos os dias no período
  const allDays: DayData[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const key = currentDate.toISOString().split('T')[0]
    const existingData = dayDataMap.get(key)
    
    allDays.push(existingData || {
      date: new Date(currentDate),
      count: 0,
      totalMinutes: 0,
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Calcular níveis de intensidade
  const counts = allDays.filter(d => d.count > 0).map(d => d.count)
  const maxCount = Math.max(...counts, 1)
  
  const getIntensityLevel = (count: number): number => {
    if (count === 0) return 0
    const percentage = (count / maxCount) * 100
    if (percentage <= 25) return 1
    if (percentage <= 50) return 2
    if (percentage <= 75) return 3
    return 4
  }

  // Organizar dias em semanas
  const weeks: DayData[][] = []
  let currentWeek: DayData[] = []
  
  // Ajustar primeiro dia para começar no domingo
  const firstDay = allDays[0]
  const firstDayOfWeek = firstDay.date.getDay()
  
  // Preencher dias vazios antes do primeiro dia
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: new Date(0),
      count: -1, // Marcador para dia inexistente
      totalMinutes: 0,
    })
  }
  
  allDays.forEach((day) => {
    currentWeek.push(day)
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  
  // Adicionar última semana se incompleta
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(0),
        count: -1,
        totalMinutes: 0,
      })
    }
    weeks.push(currentWeek)
  }

  // Obter labels de meses
  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth = -1
  
  weeks.forEach((week, weekIndex) => {
    // Pegar o primeiro dia (domingo) da semana que seja válido
    const sunday = week[0]
    if (sunday && sunday.count >= 0) {
      const month = sunday.date.getMonth()
      if (month !== lastMonth) {
        monthLabels.push({
          month: sunday.date.toLocaleDateString('pt-BR', { month: 'short' }),
          weekIndex,
        })
        lastMonth = month
      }
    } else {
      // Se domingo não for válido, pegar o primeiro dia válido da semana
      const firstValidDay = week.find(d => d.count >= 0)
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth()
        if (month !== lastMonth) {
          monthLabels.push({
            month: firstValidDay.date.toLocaleDateString('pt-BR', { month: 'short' }),
            weekIndex,
          })
          lastMonth = month
        }
      }
    }
  })

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    if (day.count >= 0) {
      setHoveredDay(day)
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
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
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Heatmap de Atividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="w-full min-w-fit">
            {/* Labels de meses */}
            <div className="flex mb-2 ml-[51px] relative h-4" style={{ width: `calc(100% - 51px)` }}>
              {monthLabels.map((label, index) => {
                const totalWeeks = weeks.length
                const weekWidthPercent = (100 / totalWeeks)
                const leftPosition = (label.weekIndex / totalWeeks) * 100
                return (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground absolute"
                    style={{
                      left: `${leftPosition}%`,
                    }}
                  >
                    {label.month.charAt(0).toUpperCase() + label.month.slice(1)}
                  </div>
                )
              })}
            </div>
            
            {/* Grid de dias */}
            <div className="flex gap-1">
              {/* Labels de dias da semana */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2 justify-around shrink-0">
                <div className="h-3 flex items-center">Dom</div>
                <div className="h-3 flex items-center">Seg</div>
                <div className="h-3 flex items-center">Ter</div>
                <div className="h-3 flex items-center">Qua</div>
                <div className="h-3 flex items-center">Qui</div>
                <div className="h-3 flex items-center">Sex</div>
                <div className="h-3 flex items-center">Sáb</div>
              </div>
              
              {/* Grid de semanas */}
              <div className="flex gap-1 flex-1 min-w-0">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1 flex-1 min-w-0">
                    {week.map((day, dayIndex) => {
                      const dayKey = day.date.toISOString().split('T')[0]
                      const uniqueKey = day.count < 0 ? `empty-${weekIndex}-${dayIndex}` : dayKey
                      
                      if (day.count < 0) {
                        return <div key={uniqueKey} className="w-full aspect-square" />
                      }
                      
                      const level = getIntensityLevel(day.count)
                      const colors = [
                        'bg-muted',
                        'bg-primary/20',
                        'bg-primary/40',
                        'bg-primary/60',
                        'bg-primary/80',
                      ]
                      
                      return (
                        <div
                          key={uniqueKey}
                          className={`w-full aspect-square rounded-sm ${colors[level]} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                          onMouseEnter={(e) => handleMouseEnter(day, e)}
                          onMouseLeave={handleMouseLeave}
                          aria-label={`${day.date.toLocaleDateString('pt-BR')}: ${day.count} jogatinas`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legenda */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-primary/20" />
                <div className="w-3 h-3 rounded-sm bg-primary/40" />
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                <div className="w-3 h-3 rounded-sm bg-primary/80" />
              </div>
              <span>Mais</span>
            </div>
          </div>
        </div>
        
        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md text-sm border pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
            }}
          >
            <div className="font-semibold">
              {hoveredDay.date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="text-muted-foreground">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'jogatina' : 'jogatinas'}
            </div>
            {hoveredDay.totalMinutes > 0 && (
              <div className="text-muted-foreground text-xs">
                {Math.floor(hoveredDay.totalMinutes / 60)}h {hoveredDay.totalMinutes % 60}m jogados
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
