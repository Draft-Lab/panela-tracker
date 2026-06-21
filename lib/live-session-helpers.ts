export function getLiveSessionStartedAt(input: {
  first_event_at?: string | null
  date: string
}): string {
  return input.first_event_at ?? input.date
}

export function formatLiveSessionElapsed(
  startedAt: string,
  now: Date = new Date(),
): string {
  const start = new Date(startedAt)
  const diffMs = Math.max(0, now.getTime() - start.getTime())
  const diffMins = Math.floor(diffMs / 60_000)

  if (diffMins < 1) {
    return "agora"
  }

  if (diffMins < 60) {
    return `${diffMins} min`
  }

  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}min`
}

export function formatLiveSessionStartLabel(
  startedAt: string,
  now: Date = new Date(),
): string {
  const start = new Date(startedAt)
  const timeLabel = start.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const startDay = new Date(start)
  startDay.setHours(0, 0, 0, 0)

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (today.getTime() - startDay.getTime()) / 86_400_000,
  )

  if (diffDays === 0) {
    return `Hoje às ${timeLabel}`
  }

  if (diffDays === 1) {
    return `Ontem às ${timeLabel}`
  }

  const dateLabel = start.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })

  return `${dateLabel} às ${timeLabel}`
}

export function formatLiveSessionStartLabelCompact(
  startedAt: string,
  now: Date = new Date(),
): string {
  const start = new Date(startedAt)
  const timeLabel = start.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const startDay = new Date(start)
  startDay.setHours(0, 0, 0, 0)

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (today.getTime() - startDay.getTime()) / 86_400_000,
  )

  if (diffDays === 0) {
    return `desde ${timeLabel}`
  }

  if (diffDays === 1) {
    return `desde ontem ${timeLabel}`
  }

  const dateLabel = start.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })

  return `desde ${dateLabel} ${timeLabel}`
}
