"use client"

import { Fragment, useState, type MouseEvent } from "react"
import { getDateKey } from "@/lib/calendar-helpers"
import {
  getJogatinaActivityDays,
  splitMinutesAcrossActivityDays,
} from "@/lib/jogatina-date-helpers"
import type { Jogatina, Game } from "@/lib/types"

interface ActivityHeatmapProps {
  jogatinas: (Jogatina & { game: Game })[]
}

interface DayData {
  date: Date
  count: number
  totalMinutes: number
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function ActivityHeatmap({ jogatinas }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)
  startDate.setHours(0, 0, 0, 0)

  const dayDataMap = new Map<string, DayData>()

  jogatinas.forEach((jogatina) => {
    const activityDays = getJogatinaActivityDays(jogatina)
    const minutesByDay = splitMinutesAcrossActivityDays(
      jogatina,
      jogatina.total_duration_minutes || 0,
    )

    activityDays.forEach((activityDay) => {
      if (activityDay < startDate || activityDay > endDate) return

      const key = getDateKey(activityDay)

      if (!dayDataMap.has(key)) {
        dayDataMap.set(key, {
          date: new Date(activityDay),
          count: 0,
          totalMinutes: 0,
        })
      }

      const dayData = dayDataMap.get(key)!
      dayData.count++
      dayData.totalMinutes += minutesByDay.get(key) || 0
    })
  })

  const allDays: DayData[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const key = getDateKey(currentDate)

    const existingData = dayDataMap.get(key)

    allDays.push(
      existingData || {
        date: new Date(currentDate),
        count: 0,
        totalMinutes: 0,
      },
    )

    currentDate.setDate(currentDate.getDate() + 1)
  }

  const counts = allDays.filter((d) => d.count > 0).map((d) => d.count)
  const maxCount = Math.max(...counts, 1)

  const getIntensityLevel = (count: number): number => {
    if (count === 0) return 0
    const percentage = (count / maxCount) * 100
    if (percentage <= 25) return 1
    if (percentage <= 50) return 2
    if (percentage <= 75) return 3
    return 4
  }

  const weeks: DayData[][] = []
  let currentWeek: DayData[] = []

  const firstDayOfWeek = allDays[0].date.getDay()

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: new Date(0),
      count: -1,
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

  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d) => d.count >= 0)
    if (firstValidDay) {
      const month = firstValidDay.date.getMonth()
      if (month !== lastMonth) {
        monthLabels.push({
          month: firstValidDay.date.toLocaleDateString("pt-BR", {
            month: "short",
          }),
          weekIndex,
        })
        lastMonth = month
      }
    }
  })

  const handleMouseEnter = (day: DayData, event: MouseEvent) => {
    if (day.count >= 0) {
      setHoveredDay(day)
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const intensityColors = [
    "bg-muted",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/60",
    "bg-primary/80",
  ]

  const gridColumns = `2.25rem repeat(${weeks.length}, minmax(0, 1fr))`

  return (
    <div className="min-w-0 w-full px-1 sm:px-0">
      <div
        className="mb-2 grid gap-[3px]"
        style={{ gridTemplateColumns: gridColumns }}
      >
        <div />
        {weeks.map((_, weekIndex) => {
          const label = monthLabels.find((m) => m.weekIndex === weekIndex)
          return (
            <div
              key={`month-${weekIndex}`}
              className="truncate text-[10px] leading-none text-muted-foreground"
            >
              {label
                ? label.month.charAt(0).toUpperCase() + label.month.slice(1)
                : ""}
            </div>
          )
        })}
      </div>

      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: gridColumns }}
      >
        {WEEKDAY_LABELS.map((weekdayLabel, rowIndex) => (
          <Fragment key={weekdayLabel}>
            <div className="flex items-center text-[10px] leading-none text-muted-foreground">
              {weekdayLabel}
            </div>
            {weeks.map((week, weekIndex) => {
              const day = week[rowIndex]
              const year = day.date.getFullYear()
              const month = String(day.date.getMonth() + 1).padStart(2, "0")
              const dayStr = String(day.date.getDate()).padStart(2, "0")
              const dayKey = `${year}-${month}-${dayStr}`
              const uniqueKey =
                day.count < 0 ? `empty-${weekIndex}-${rowIndex}` : dayKey

              if (day.count < 0) {
                return (
                  <div
                    key={uniqueKey}
                    className="aspect-square w-full min-w-0 rounded-[2px]"
                  />
                )
              }

              const level = getIntensityLevel(day.count)

              return (
                <div
                  key={uniqueKey}
                  className={`aspect-square w-full min-w-0 rounded-[2px] ${intensityColors[level]} transition-colors hover:ring-1 hover:ring-primary`}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseLeave={handleMouseLeave}
                  aria-label={`${day.date.toLocaleDateString("pt-BR")}: ${day.count} jogatinas`}
                />
              )
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-1">
          {intensityColors.map((color, index) => (
            <div key={index} className={`h-3 w-3 rounded-[2px] ${color}`} />
          ))}
        </div>
        <span>Mais</span>
      </div>

      {hoveredDay && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
          style={{
            left: Math.min(mousePosition.x + 10, window.innerWidth - 200),
            top: Math.min(mousePosition.y + 10, window.innerHeight - 120),
          }}
        >
          <div className="font-semibold">
            {hoveredDay.date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-muted-foreground">
            {hoveredDay.count}{" "}
            {hoveredDay.count === 1 ? "jogatina" : "jogatinas"}
          </div>
          {hoveredDay.totalMinutes > 0 && (
            <div className="text-xs text-muted-foreground">
              {Math.floor(hoveredDay.totalMinutes / 60)}h{" "}
              {hoveredDay.totalMinutes % 60}m jogados
            </div>
          )}
        </div>
      )}
    </div>
  )
}
