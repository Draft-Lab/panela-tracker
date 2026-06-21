import type { JogatinaEvent, JogatinaPlayer, Player } from "@/lib/types"
import { formatDuration } from "@/lib/calendar-helpers"

type SessionEvent = Pick<JogatinaEvent, "event_type" | "timestamp" | "player_id">

export interface CurrentSessionParticipant {
  id: string
  player: Player
  isActive: boolean
  elapsedMinutes: number
}

export function computePlayerSessionElapsedMinutes(
  playerEvents: Pick<JogatinaEvent, "event_type" | "timestamp">[],
  isActive: boolean,
  now: Date = new Date(),
): number {
  const sorted = [...playerEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  let totalMs = 0
  let index = 0

  while (index < sorted.length) {
    const event = sorted[index]

    if (event.event_type !== "player_joined") {
      index += 1
      continue
    }

    const joinTime = new Date(event.timestamp).getTime()
    const leaveEvent = sorted
      .slice(index + 1)
      .find((entry) => entry.event_type === "player_left")

    if (leaveEvent) {
      totalMs += new Date(leaveEvent.timestamp).getTime() - joinTime
      index = sorted.indexOf(leaveEvent) + 1
      continue
    }

    if (isActive) {
      totalMs += Math.max(0, now.getTime() - joinTime)
    }

    break
  }

  return Math.max(0, Math.round(totalMs / 60_000))
}

function resolveParticipantMinutes(
  player: JogatinaPlayer,
  playerEvents: Pick<JogatinaEvent, "event_type" | "timestamp">[],
  now: Date,
): number {
  if (playerEvents.length > 0) {
    return computePlayerSessionElapsedMinutes(
      playerEvents,
      player.is_active,
      now,
    )
  }

  if (player.total_duration_minutes > 0) {
    return player.total_duration_minutes
  }

  return 0
}

export function buildCurrentSessionParticipants(
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[],
  events: SessionEvent[],
  now: Date = new Date(),
): { active: CurrentSessionParticipant[]; participated: CurrentSessionParticipant[] } {
  const active: CurrentSessionParticipant[] = []
  const participated: CurrentSessionParticipant[] = []

  for (const entry of jogatinaPlayers) {
    const playerEvents = events.filter(
      (event) => event.player_id === entry.player_id,
    )
    const elapsedMinutes = resolveParticipantMinutes(entry, playerEvents, now)
    const hasParticipated =
      playerEvents.length > 0 || elapsedMinutes > 0 || entry.is_active

    if (!hasParticipated) {
      continue
    }

    const participant: CurrentSessionParticipant = {
      id: entry.id,
      player: entry.player,
      isActive: entry.is_active,
      elapsedMinutes,
    }

    if (entry.is_active) {
      active.push(participant)
      continue
    }

    participated.push(participant)
  }

  const byElapsed = (a: CurrentSessionParticipant, b: CurrentSessionParticipant) =>
    b.elapsedMinutes - a.elapsedMinutes

  return {
    active: active.sort((a, b) => a.player.name.localeCompare(b.player.name, "pt-BR")),
    participated: participated.sort(byElapsed),
  }
}

export function formatParticipantDuration(minutes: number): string {
  if (minutes <= 0) {
    return "participou"
  }

  return formatDuration(minutes)
}

export function formatParticipantTooltip(
  participant: CurrentSessionParticipant,
): string {
  if (participant.isActive) {
    return participant.elapsedMinutes > 0
      ? `${participant.player.name} · ${formatDuration(participant.elapsedMinutes)} jogando nesta sessão`
      : `${participant.player.name} · entrou agora nesta sessão`
  }

  return participant.elapsedMinutes > 0
    ? `${participant.player.name} · ficou ${formatDuration(participant.elapsedMinutes)} e saiu`
    : `${participant.player.name} · passou pela sessão`
}
