"use client"

import { useMemo } from "react"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import {
  TimelineEventItem,
  type TimelineEvent,
} from "@/components/landing/timeline-event-item"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import { useIsClient } from "@/hooks/use-is-client"
import { groupByDateLabel } from "@/lib/local-date"
import { cn } from "@/lib/utils"

interface LandingTimelineSectionProps {
  jogatinas: (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  })[]
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[]
  limit?: number
  compact?: boolean
}

function buildRecentEvents(
  jogatinas: LandingTimelineSectionProps["jogatinas"],
  jogatinaPlayers: LandingTimelineSectionProps["jogatinaPlayers"],
  limit: number,
): TimelineEvent[] {
  return jogatinas.slice(0, limit).map((jogatina) => {
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
  limit = 6,
  compact = false,
}: LandingTimelineSectionProps) {
  const isClient = useIsClient()

  const recentEvents = useMemo(
    () => buildRecentEvents(jogatinas, jogatinaPlayers, limit),
    [jogatinas, jogatinaPlayers, limit],
  )

  const groupedEvents = useMemo(() => {
    if (!isClient) {
      return [["", recentEvents] as const]
    }

    return groupByDateLabel(recentEvents, (event) => event.jogatina.date)
  }, [isClient, recentEvents])

  if (recentEvents.length === 0) {
    return <LandingEmptyState>Nenhum evento recente</LandingEmptyState>
  }

  return (
    <div className={cn("rounded-[1.5rem] border border-white/[0.08] bg-card/25 p-3 sm:p-4", compact && "p-2.5")}>
      <div className="space-y-3">
        {groupedEvents.map(([label, events]) => (
          <section key={label || "timeline-events"}>
            {label && (
              <div className="mb-2 grid grid-cols-[0.875rem_minmax(0,1fr)] gap-x-3">
                <div aria-hidden />
                <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </h3>
              </div>
            )}

            <div>
              {events.map((event, index) => (
                <TimelineEventItem
                  key={event.jogatina.id}
                  event={event}
                  isFirst={index === 0}
                  isLast={index === events.length - 1}
                  compact={compact}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
