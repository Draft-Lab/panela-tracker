import { calculatePlayerStats } from "@/lib/status-helpers"
import { DropperRankExtended } from "@/components/hall-of-shame/dropper-rank-extended"
import { DropperRankPodium } from "@/components/hall-of-shame/dropper-rank-podium"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import type { JogatinaPlayer, SeasonParticipant, Player } from "@/lib/types"

const TOP_PODIUM = 3
const TOP_EXTENDED = 10

interface HallOfShameProps {
  jogatinaPlayers: (JogatinaPlayer & { player?: Player })[]
  seasonParticipants?: (SeasonParticipant & { player?: Player })[]
}

export function HallOfShame({
  jogatinaPlayers,
  seasonParticipants = [],
}: HallOfShameProps) {
  const rankedDroppers = calculatePlayerStats(jogatinaPlayers, seasonParticipants)
    .filter((player) => player.totalJogatinas > 0)
    .sort((a, b) => b.dropos - a.dropos)

  const topDroppers = rankedDroppers.slice(0, TOP_PODIUM)
  const extendedDroppers = rankedDroppers.slice(TOP_PODIUM, TOP_EXTENDED)

  if (topDroppers.length === 0) {
    return (
      <LandingEmptyState>Ninguém dropou ainda. Milagre.</LandingEmptyState>
    )
  }

  return (
    <div className="space-y-3">
      <DropperRankPodium topDroppers={topDroppers} />
      {extendedDroppers.length > 0 && (
        <DropperRankExtended droppers={extendedDroppers} startRank={TOP_PODIUM + 1} />
      )}
    </div>
  )
}
