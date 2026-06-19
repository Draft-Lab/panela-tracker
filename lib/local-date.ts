const LOCALE = "pt-BR"

export function formatLocalTime(iso: string) {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getDateGroupLabel(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) {
    const weekday = date.toLocaleDateString(LOCALE, { weekday: "long" })
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
  }

  const formatted = date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatLastPlayedLabel(iso: string): string {
  const date = new Date(iso)
  const label = getDateGroupLabel(date)
  const time = formatLocalTime(iso)

  if (label === "Hoje") return `Hoje, ${time}`
  if (label === "Ontem") return `Ontem, ${time}`

  const formatted = date.toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
  })

  return `${formatted}, ${time}`
}

export function groupByDateLabel<T>(
  items: T[],
  getDate: (item: T) => string,
) {
  const groups = new Map<string, T[]>()

  items.forEach((item) => {
    const label = getDateGroupLabel(new Date(getDate(item)))
    const existing = groups.get(label) ?? []
    existing.push(item)
    groups.set(label, existing)
  })

  return Array.from(groups.entries())
}
