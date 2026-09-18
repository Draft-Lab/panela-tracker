export type WeeklySummarySession = {
  date: string
  total_duration_minutes: number | null
}

export type WeeklySummary = {
  totalMinutes: number
  sessionsCount: number
  activeDays: number
  minutesChange: number
  sessionsChange: number
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

function summarize(sessions: WeeklySummarySession[]): Omit<WeeklySummary, "minutesChange" | "sessionsChange"> {
  return {
    totalMinutes: sessions.reduce(
      (total, session) => total + Math.max(0, session.total_duration_minutes ?? 0),
      0,
    ),
    sessionsCount: sessions.length,
    activeDays: new Set(sessions.map((session) => session.date.slice(0, 10))).size,
  }
}

export function buildWeeklySummary(
  sessions: WeeklySummarySession[],
  now = new Date(),
): WeeklySummary {
  const currentWeekStart = startOfDay(subtractDays(now, 6))
  const previousWeekStart = subtractDays(currentWeekStart, 7)

  const currentWeek: WeeklySummarySession[] = []
  const previousWeek: WeeklySummarySession[] = []

  sessions.forEach((session) => {
    const timestamp = new Date(session.date).getTime()
    if (!Number.isFinite(timestamp)) return

    if (timestamp >= currentWeekStart.getTime()) {
      currentWeek.push(session)
    } else if (timestamp >= previousWeekStart.getTime()) {
      previousWeek.push(session)
    }
  })

  const current = summarize(currentWeek)
  const previous = summarize(previousWeek)

  return {
    ...current,
    minutesChange: current.totalMinutes - previous.totalMinutes,
    sessionsChange: current.sessionsCount - previous.sessionsCount,
  }
}

export function formatWeeklyChange(minutesChange: number): string {
  if (minutesChange === 0) return "mesmo ritmo da semana passada"

  const hours = Math.max(1, Math.round(Math.abs(minutesChange) / 60))
  const direction = minutesChange > 0 ? "a mais" : "a menos"
  return `${hours}h ${direction} que na semana passada`
}

export function formatWeeklyDuration(totalMinutes: number): string {
  const minutes = Math.max(0, totalMinutes)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes}min`
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}min`
}
