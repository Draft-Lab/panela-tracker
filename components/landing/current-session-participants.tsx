"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDuration } from "@/lib/calendar-helpers"
import {
  buildCurrentSessionParticipants,
  formatParticipantTooltip,
  type CurrentSessionParticipant,
} from "@/lib/current-session-player-helpers"
import type { JogatinaEvent, JogatinaPlayer, Player } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CurrentSessionParticipantsProps {
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[]
  events: Pick<JogatinaEvent, "event_type" | "timestamp" | "player_id">[]
}

export function CurrentSessionParticipants({
  jogatinaPlayers,
  events,
}: CurrentSessionParticipantsProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [])

  const { active, participated } = useMemo(
    () => buildCurrentSessionParticipants(jogatinaPlayers, events, now),
    [jogatinaPlayers, events, now],
  )

  if (active.length === 0 && participated.length === 0) {
    return null
  }

  return (
    <div className="space-y-0.5">
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {active.map((participant, index) => (
            <ParticipantChip
              key={participant.id}
              participant={participant}
              tone="active"
              showSeparator={index > 0}
            />
          ))}
        </div>
      )}

      {participated.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/65">
            Saiu
          </span>
          {participated.map((participant, index) => (
            <ParticipantChip
              key={participant.id}
              participant={participant}
              tone="past"
              showSeparator={index > 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ParticipantChip({
  participant,
  tone,
  showSeparator,
}: {
  participant: CurrentSessionParticipant
  tone: "active" | "past"
  showSeparator: boolean
}) {
  const isActive = tone === "active"
  const { player, elapsedMinutes } = participant
  const duration =
    elapsedMinutes > 0 ? formatDuration(elapsedMinutes) : null

  return (
    <>
      {showSeparator && (
        <span className="text-[10px] text-muted-foreground/35" aria-hidden>
          ·
        </span>
      )}
      <span
        className="inline-flex min-w-0 items-center gap-1"
        title={formatParticipantTooltip(participant)}
      >
        <Avatar
          className={cn(
            "h-5 w-5 shrink-0",
            isActive ? "opacity-100" : "opacity-45 grayscale",
          )}
        >
          {player.avatar_url && (
            <AvatarImage src={player.avatar_url} alt={player.name} />
          )}
          <AvatarFallback className="text-[8px]">
            {player.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span
          className={cn(
            "truncate text-xs",
            isActive ? "font-medium text-foreground" : "text-muted-foreground",
          )}
        >
          {player.name}
        </span>

        {duration && (
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {duration}
          </span>
        )}
      </span>
    </>
  )
}
