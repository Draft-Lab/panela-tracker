"use client"

import { Fragment, useMemo, useState, type MouseEvent } from "react"
import { createPortal } from "react-dom"
import { getDateKey } from "@/lib/calendar-helpers"
import {
  getJogatinaActivityDays,
  splitMinutesAcrossActivityDays,
} from "@/lib/jogatina-date-helpers"
import type { Jogatina, Game } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useHeatmapLayout } from "@/hooks/use-heatmap-layout"

interface ActivityHeatmapProps {
  jogatinas: (Jogatina & { game: Game })[]
}

interface DayData {
  date: Date
  count: number
  totalMinutes: number
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const INTENSITY_COLORS = [
  "bg-muted/80",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/65",
  "bg-primary",
]

function buildHeatmapData(jogatinas: (Jogatina & { game: Game })[]) {
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

  const weeks: DayData[][] = []
  let currentWeek: DayData[] = []
  const firstDayOfWeek = allDays[0].date.getDay()

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), count: -1, totalMinutes: 0 })
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
      currentWeek.push({ date: new Date(0), count: -1, totalMinutes: 0 })
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

  return { weeks, monthLabels, maxCount }
}

function getIntensityLevel(count: number, maxCount: number): number {
  if (count === 0) return 0
  const percentage = (count / maxCount) * 100
  if (percentage <= 25) return 1
  if (percentage <= 50) return 2
  if (percentage <= 75) return 3
  return 4
}

interface HeatmapTooltipProps {
  day: DayData
  x: number
  y: number
}

function HeatmapTooltip({ day, x, y }: HeatmapTooltipProps) {
  if (typeof document === "undefined") return null

  return createPortal(
    <div
      className="pointer-events-none fixed z-[100] max-w-xs rounded-xl border border-white/10 bg-card/95 px-3 py-2 text-sm text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md"
      style={{
        left: Math.min(x + 12, window.innerWidth - 220),
        top: Math.min(y + 12, window.innerHeight - 120),
      }}
    >
      <div className="font-semibold">
        {day.date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
      <div className="text-muted-foreground">
        {day.count} {day.count === 1 ? "jogatina" : "jogatinas"}
      </div>
      {day.totalMinutes > 0 && (
        <div className="text-xs text-muted-foreground">
          {Math.floor(day.totalMinutes / 60)}h {day.totalMinutes % 60}m jogados
        </div>
      )}
    </div>,
    document.body,
  )
}

export function ActivityHeatmap({ jogatinas }: ActivityHeatmapProps) {
  const { weeks, monthLabels, maxCount } = useMemo(
    () => buildHeatmapData(jogatinas),
    [jogatinas],
  )

  const {
    containerRef,
    gridColumns,
    cellSize,
    needsScroll,
    gridWidth,
    fillWidth,
    isMobile,
  } = useHeatmapLayout(weeks.length)

  const [activeDay, setActiveDay] = useState<DayData | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const showDay = (day: DayData, x: number, y: number) => {
    if (day.count < 0) return
    setActiveDay(day)
    setPointer({ x, y })
  }

  const handleMouseEnter = (day: DayData, event: MouseEvent) => {
    showDay(day, event.clientX, event.clientY)
  }

  const handleMouseMove = (day: DayData, event: MouseEvent) => {
    if (day.count >= 0 && activeDay?.date.getTime() === day.date.getTime()) {
      setPointer({ x: event.clientX, y: event.clientY })
    }
  }

  const handleCellClick = (day: DayData, event: MouseEvent<HTMLDivElement>) => {
    if (day.count < 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const isSameDay = activeDay?.date.getTime() === day.date.getTime()
    if (isSameDay) {
      setActiveDay(null)
      return
    }
    showDay(day, rect.left + rect.width / 2, rect.top)
  }

  const rowHeight = cellSize

  return (
    <div ref={containerRef} className="min-w-0 w-full">
      <div className="relative">
        {needsScroll && isMobile && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card/95 via-card/50 to-transparent lg:hidden"
            aria-hidden
          />
        )}

        <div
          className={cn(
            needsScroll &&
              "overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          <div
            className={cn("w-full", !fillWidth && needsScroll && "mx-auto")}
            style={{
              width: needsScroll ? gridWidth : "100%",
              minWidth: needsScroll ? gridWidth : undefined,
            }}
          >
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
                      ? label.month.charAt(0).toUpperCase() +
                        label.month.slice(1)
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
                  <div
                    className={cn(
                      "flex items-center text-[10px] leading-none text-muted-foreground",
                      !fillWidth && "shrink-0",
                    )}
                    style={fillWidth ? undefined : { height: rowHeight }}
                  >
                    {weekdayLabel}
                  </div>

                  {weeks.map((week, weekIndex) => {
                    const day = week[rowIndex]
                    const year = day.date.getFullYear()
                    const month = String(day.date.getMonth() + 1).padStart(
                      2,
                      "0",
                    )
                    const dayStr = String(day.date.getDate()).padStart(2, "0")
                    const dayKey = `${year}-${month}-${dayStr}`
                    const uniqueKey =
                      day.count < 0
                        ? `empty-${weekIndex}-${rowIndex}`
                        : dayKey

                    if (day.count < 0) {
                      return (
                        <div
                          key={uniqueKey}
                          className={cn(fillWidth && "aspect-square w-full min-w-0")}
                          style={
                            fillWidth
                              ? undefined
                              : { width: cellSize, height: rowHeight }
                          }
                        />
                      )
                    }

                    const level = getIntensityLevel(day.count, maxCount)
                    const isActive =
                      activeDay?.date.getTime() === day.date.getTime()

                    return (
                      <div
                        key={uniqueKey}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "cursor-pointer rounded-[3px] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          INTENSITY_COLORS[level],
                          fillWidth && "aspect-square w-full min-w-0",
                          "hover:z-10 hover:scale-110 hover:ring-2 hover:ring-primary/70 hover:ring-offset-1 hover:ring-offset-background",
                          isActive &&
                            "z-10 scale-110 ring-2 ring-primary ring-offset-1 ring-offset-background",
                        )}
                        style={
                          fillWidth
                            ? undefined
                            : { width: cellSize, height: rowHeight }
                        }
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseMove={(e) => handleMouseMove(day, e)}
                        onMouseLeave={() => setActiveDay(null)}
                        onClick={(e) => handleCellClick(day, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            const rect = e.currentTarget.getBoundingClientRect()
                            showDay(
                              day,
                              rect.left + rect.width / 2,
                              rect.top,
                            )
                          }
                        }}
                        aria-label={`${day.date.toLocaleDateString("pt-BR")}: ${day.count} jogatinas`}
                      />
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-1">
            {INTENSITY_COLORS.map((color, index) => (
              <div
                key={index}
                className={cn("rounded-[3px]", color)}
                style={{ width: cellSize, height: cellSize }}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>

        {needsScroll && isMobile && (
          <span className="text-[10px] text-muted-foreground/80 lg:hidden">
            Deslize para ver mais
          </span>
        )}
      </div>

      {activeDay && (
        <HeatmapTooltip day={activeDay} x={pointer.x} y={pointer.y} />
      )}
    </div>
  )
}
