"use client"

import { useMemo } from "react"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import {
  TimelineEventItem,
  type TimelineEvent,
} from "@/components/landing/timeline-event-item"
import { useIsClient } from "@/hooks/use-is-client"
import { groupByDateLabel } from "@/lib/local-date"

interface LandingTimelineSectionProps {
  jogatinas: (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  })[]
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[]
}

function buildRecentEvents(
  jogatinas: LandingTimelineSectionProps["jogatinas"],
  jogatinaPlayers: LandingTimelineSectionProps["jogatinaPlayers"],
): TimelineEvent[] {
  return jogatinas.slice(0, 8).map((jogatina) => {
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
}

export function LandingTimelineSection({
  jogatinas,
  jogatinaPlayers,
}: LandingTimelineSectionProps) {
  const isClient = useIsClient()

  const recentEvents = useMemo(
    () => buildRecentEvents(jogatinas, jogatinaPlayers),
    [jogatinas, jogatinaPlayers],
  )

  const groupedEvents = useMemo(() => {
    if (!isClient) {
      return [["", recentEvents] as const]
    }

    return groupByDateLabel(recentEvents, (event) => event.jogatina.date)
  }, [isClient, recentEvents])

  if (recentEvents.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
        Nenhum evento recente
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {groupedEvents.map(([label, events]) => (
        <section key={label || "timeline-events"}>
          {label && (
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </h3>
          )}
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
