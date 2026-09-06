"use client"

import { createPortal } from "react-dom"
import { useMemo, useState, type PointerEvent } from "react"
import { getDateKey } from "@/lib/calendar-helpers"
import { getJogatinaActivityDays, splitMinutesAcrossActivityDays } from "@/lib/jogatina-date-helpers"
import type { Game, Jogatina } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ActivityHeatmapProps { jogatinas: (Jogatina & { game: Game })[] }
interface DayData { date: Date; count: number; totalMinutes: number }
interface HoveredDay { day: DayData; x: number; y: number }

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", { month: "short" })
const DAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" })
const INTENSITY_OPACITY = [0.08, 0.28, 0.48, 0.72, 1]

function startOfDay(date: Date) { const result = new Date(date); result.setHours(0, 0, 0, 0); return result }

function buildHeatmapData(jogatinas: (Jogatina & { game: Game })[]) {
  const endDate = startOfDay(new Date())
  const startDate = new Date(endDate)
  startDate.setMonth(startDate.getMonth() - 12)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  const dataByDate = new Map<string, DayData>()

  jogatinas.forEach((jogatina) => {
    const minutesByDay = splitMinutesAcrossActivityDays(jogatina, jogatina.total_duration_minutes || 0)
    getJogatinaActivityDays(jogatina).forEach((date) => {
      const day = startOfDay(date)
      if (day < startDate || day > endDate) return
      const key = getDateKey(day)
      const current = dataByDate.get(key) ?? { date: day, count: 0, totalMinutes: 0 }
      current.count += 1
      current.totalMinutes += minutesByDay.get(key) || 0
      dataByDate.set(key, current)
    })
  })

  const weeks: DayData[][] = []
  const cursor = new Date(startDate)
  let week: DayData[] = []
  while (cursor <= endDate || week.length > 0) {
    const key = getDateKey(cursor)
    week.push(dataByDate.get(key) ?? { date: new Date(cursor), count: 0, totalMinutes: 0 })
    if (week.length === 7) { weeks.push(week); week = [] }
    cursor.setDate(cursor.getDate() + 1)
    if (cursor > endDate && week.length === 0) break
  }

  const values = weeks.flat().map((day) => day.totalMinutes || day.count)
  const maxValue = Math.max(...values, 1)
  const monthLabels = weeks.map((currentWeek, index) => {
    const previous = weeks[index - 1]?.[0]
    return !previous || previous.date.getMonth() !== currentWeek[0].date.getMonth()
      ? MONTH_FORMATTER.format(currentWeek[0].date)
      : null
  })
  return { weeks, monthLabels, maxValue }
}

function getIntensity(day: DayData, maxValue: number) {
  const value = day.totalMinutes || day.count
  return value ? Math.min(4, Math.max(1, Math.ceil((value / maxValue) * 4))) : 0
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours === 0) return `${remaining}min`
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}min`
}

function HeatmapTooltip({ hovered }: { hovered: HoveredDay }) {
  if (typeof document === "undefined") return null
  return createPortal(
    <div className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background shadow-lg" style={{ left: Math.min(Math.max(hovered.x, 90), window.innerWidth - 90), top: hovered.y }}>
      {hovered.day.count} {hovered.day.count === 1 ? "jogatina" : "jogatinas"} em {DAY_FORMATTER.format(hovered.day.date)}
      {hovered.day.totalMinutes > 0 && <span className="ml-1.5 text-background/65">· {formatDuration(Math.round(hovered.day.totalMinutes))}</span>}
    </div>,
    document.body,
  )
}

export function ActivityHeatmap({ jogatinas }: ActivityHeatmapProps) {
  const { weeks, monthLabels, maxValue } = useMemo(() => buildHeatmapData(jogatinas), [jogatinas])
  const [hovered, setHovered] = useState<HoveredDay | null>(null)
  const totalSessions = useMemo(() => weeks.flat().reduce((sum, day) => sum + day.count, 0), [weeks])
  const activeDays = useMemo(() => weeks.flat().filter((day) => day.count > 0).length, [weeks])
  const showTooltip = (day: DayData, event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHovered({ day, x: rect.left + rect.width / 2, y: rect.top })
  }

  return (
    <div className="min-w-0 w-full">
      <div className="mb-5 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-base font-medium text-foreground">Atividade nos últimos 12 meses</p>
          <p className="mt-1 text-xs text-muted-foreground">{totalSessions} {totalSessions === 1 ? "jogatina" : "jogatinas"} em {activeDays} dias ativos</p>
        </div>
        <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:block">Hoje</span>
      </div>

      <div className="relative overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-w-[610px]">
          <div className="mb-2 flex gap-[3px] pl-9" aria-hidden>
            {weeks.map((_, index) => <div key={index} className="w-[11px] shrink-0 text-[10px] leading-none text-muted-foreground">{monthLabels[index]?.replace(".", "") ?? ""}</div>)}
          </div>
          <div className="flex gap-1">
            <div className="flex w-8 shrink-0 flex-col justify-between gap-[3px] py-px text-[10px] leading-none text-muted-foreground">{WEEKDAY_LABELS.map((label) => <span key={label}>{label}</span>)}</div>
            <div className="flex gap-[3px]" role="img" aria-label="Heatmap de atividade por dia">
              {weeks.map((week, weekIndex) => <div key={weekIndex} className="flex shrink-0 flex-col gap-[3px]">
                {week.map((day) => {
                  const intensity = getIntensity(day, maxValue)
                  const label = `${DAY_FORMATTER.format(day.date)}: ${day.count} ${day.count === 1 ? "jogatina" : "jogatinas"}`
                  return <button key={getDateKey(day.date)} type="button" aria-label={label} className={cn("h-[11px] w-[11px] rounded-[3px] bg-primary outline-none transition-transform duration-150 hover:z-10 hover:scale-125 focus-visible:z-10 focus-visible:scale-125 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background", intensity === 0 && "bg-foreground/[0.08]")} style={intensity > 0 ? { opacity: INTENSITY_OPACITY[intensity] } : undefined} onPointerEnter={(event) => showTooltip(day, event)} onPointerMove={(event) => showTooltip(day, event)} onPointerLeave={() => setHovered(null)} onFocus={(event) => showTooltip(day, event)} onBlur={() => setHovered(null)} />
                })}
              </div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-muted-foreground"><span>Menos</span><div className="flex items-center gap-1.5" aria-label="Legenda de intensidade">{INTENSITY_OPACITY.map((opacity, index) => <span key={opacity} className="h-[11px] w-[11px] rounded-[3px] bg-primary" style={index === 0 ? { backgroundColor: "hsl(var(--foreground) / 0.08)" } : { opacity }} />)}</div><span>Mais</span></div>
      {hovered && <HeatmapTooltip hovered={hovered} />}
    </div>
  )
}
