"use client"

import { createPortal } from "react-dom"
import { useMemo, useState, type SyntheticEvent } from "react"
import { getDateKey } from "@/lib/calendar-helpers"
import { getJogatinaActivityDays, splitMinutesAcrossActivityDays } from "@/lib/jogatina-date-helpers"
import type { Jogatina } from "@/lib/types"
import { cn } from "@/lib/utils"
import { buildActivityHeatmapWindow } from "@/lib/activity-heatmap-window"
import { ArrowRight, CalendarDays } from "lucide-react"

type HeatmapSession = Pick<Jogatina, "date" | "first_event_at" | "last_event_at" | "total_duration_minutes">
interface ActivityHeatmapProps { jogatinas: HeatmapSession[] }
interface DayData { date: Date; count: number; totalMinutes: number }
interface HoveredDay { day: DayData; x: number; y: number }

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", { month: "short" })
const DAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" })
const INTENSITY_OPACITY = [0.08, 0.28, 0.48, 0.72, 1]

function startOfDay(date: Date) { const result = new Date(date); result.setHours(0, 0, 0, 0); return result }

function buildHeatmapData(jogatinas: HeatmapSession[]) {
  const { firstDate: startDate, endDate, weeks: calendarWeeks, months } = buildActivityHeatmapWindow(new Date())
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

  const weeks: DayData[][] = calendarWeeks.map(week => week.map(date => dataByDate.get(getDateKey(date)) ?? { date, count: 0, totalMinutes: 0 }))
  const values = weeks.flat().map(day => day.totalMinutes || day.count)
  const maxValue = Math.max(...values, 1)
  return { weeks, months, maxValue, startDate, endDate }
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
  const { weeks, months, maxValue, startDate, endDate } = useMemo(() => buildHeatmapData(jogatinas), [jogatinas])
  const [hovered, setHovered] = useState<HoveredDay | null>(null)
  const totalSessions = useMemo(() => weeks.flat().reduce((sum, day) => sum + day.count, 0), [weeks])
  const activeDays = useMemo(() => weeks.flat().filter((day) => day.count > 0).length, [weeks])
  const showTooltip = (day: DayData, event: SyntheticEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHovered({ day, x: rect.left + rect.width / 2, y: rect.top })
  }

  return (
    <div className="homepage-heatmap min-w-0 w-full">
      <div className="mb-5 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="homepage-heatmap-title">O calendário da jogatina</p>
          <p className="mt-1 text-xs text-muted-foreground">{totalSessions} {totalSessions === 1 ? "jogatina" : "jogatinas"} em {activeDays} dias ativos</p>
        </div>
        <span className="homepage-heatmap-today"><CalendarDays size={14} aria-hidden="true" /> Até {endDate.toLocaleDateString("pt-BR", {day:"numeric",month:"short",year:"numeric"})}</span>
      </div>

      <div className="homepage-heatmap-range"><span>{months[0]?.label} {months[0]?.year}</span><ArrowRight size={14} aria-hidden="true" /><span>{months.at(-1)?.label} {months.at(-1)?.year}</span></div>
      <div className="homepage-heatmap-scroll">
        <div className="homepage-heatmap-calendar">
          <div className="homepage-heatmap-months" style={{gridTemplateColumns:`repeat(${weeks.length}, minmax(0, 1fr))`}} aria-hidden="true">
            {months.map((month,index) => <span key={`${month.year}-${month.label}`} className={index === months.length - 1 ? "is-current" : undefined} style={{gridColumn:`${month.column + 1} / span ${month.span}`}}>{month.label}</span>)}
          </div>
          <div className="homepage-heatmap-body">
            <div className="homepage-heatmap-weekdays" aria-hidden="true">{WEEKDAY_LABELS.map(label => <span key={label}>{label}</span>)}</div>
            <div className="homepage-heatmap-weeks" style={{gridTemplateColumns:`repeat(${weeks.length}, minmax(0, 1fr))`}} role="group" aria-label="Heatmap de atividade por dia">
              {weeks.map((week, weekIndex) => <div key={weekIndex} className="homepage-heatmap-week">
                {week.map(day => {
                  const intensity = getIntensity(day, maxValue)
                  const outside = day.date < startDate || day.date > endDate
                  const today = getDateKey(day.date) === getDateKey(endDate)
                  const label = `${DAY_FORMATTER.format(day.date)}: ${day.count} ${day.count === 1 ? "jogatina" : "jogatinas"}${today ? ", hoje" : ""}`
                  return <button key={getDateKey(day.date)} type="button" disabled={outside} aria-label={label} aria-current={today ? "date" : undefined} className={cn("homepage-heatmap-day", today && "is-today", outside && "is-outside")} style={{backgroundColor:intensity ? `color-mix(in srgb, var(--primary) ${INTENSITY_OPACITY[intensity]*100}%, var(--card))` : "var(--muted)"}} onPointerEnter={event => showTooltip(day,event)} onPointerLeave={() => setHovered(null)} onFocus={event => showTooltip(day,event)} onBlur={() => setHovered(null)} />
                })}
              </div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="homepage-heatmap-legend"><span>Menos tempo jogado</span><div role="img" aria-label="Intensidade: do menor ao maior tempo jogado">{INTENSITY_OPACITY.map((opacity,index) => <span key={opacity} style={{backgroundColor:index ? `color-mix(in srgb, var(--primary) ${opacity*100}%, var(--card))` : "var(--muted)"}} />)}</div><span>Mais</span></div>
      {hovered && <HeatmapTooltip hovered={hovered} />}
    </div>
  )
}
