import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import {
  TimelineEventItem,
  type TimelineEvent,
} from "@/components/landing/timeline-event-item"

interface LandingTimelineSectionProps {
  jogatinas: (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  })[]
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[]
}

function getDateGroupLabel(date: Date) {
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
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" })
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
  }

  const formatted = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function groupEventsByDate(events: TimelineEvent[]) {
  const groups = new Map<string, TimelineEvent[]>()

  events.forEach((event) => {
    const label = getDateGroupLabel(new Date(event.jogatina.date))
    const existing = groups.get(label) ?? []
    existing.push(event)
    groups.set(label, existing)
  })

  return Array.from(groups.entries())
}

export function LandingTimelineSection({
  jogatinas,
  jogatinaPlayers,
}: LandingTimelineSectionProps) {
  const recentEvents: TimelineEvent[] = jogatinas.slice(0, 8).map((jogatina) => {
    const playersFromJogatina = jogatina.jogatina_players || []
    const playersFromSeparate = jogatinaPlayers.filter(
      (jp) => jp.jogatina_id === jogatina.id,
    )

    const players =
      playersFromJogatina.length > 0 ? playersFromJogatina : playersFromSeparate

    return {
      jogatina,
      firstPlayer: players[0]?.player?.name || "Alguém",
      playerCount: players.length,
      players,
    }
  })

  if (recentEvents.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
        Nenhum evento recente
      </p>
    )
  }

  const groupedEvents = groupEventsByDate(recentEvents)

  return (
    <div className="space-y-8">
      {groupedEvents.map(([label, events]) => (
        <section key={label}>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </h3>
          <div>
            {events.map((event, index) => (
              <TimelineEventItem
                key={event.jogatina.id}
                event={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
