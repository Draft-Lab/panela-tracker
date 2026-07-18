import { History, Trophy, Users } from "lucide-react"
import { HighlightCard } from "@/components/landing-highlights/highlight-card"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import {
  findBiggestGroupSession,
  findLatestChampionZero,
  findLongestComeback,
  formatGapDays,
  formatHighlightDate,
} from "@/lib/landing-highlights-helpers"
import type { Game, Jogatina, JogatinaPlayer, Player, Season, SeasonParticipant } from "@/lib/types"

interface LandingHighlightsProps {
  jogatinas: (Jogatina & { game: Game })[]
  jogatinaPlayers: (JogatinaPlayer & {
    jogatina?: Jogatina & { game: Game }
    player?: Player
  })[]
  seasonParticipants: (SeasonParticipant & {
    season?: Season & { game: Game }
    player?: Player
  })[]
}

export function LandingHighlights({
  jogatinas,
  jogatinaPlayers,
  seasonParticipants,
}: LandingHighlightsProps) {
  const comeback = findLongestComeback(jogatinas)
  const biggestGroup = findBiggestGroupSession(jogatinas, jogatinaPlayers)
  const champion = findLatestChampionZero(jogatinaPlayers, seasonParticipants)

  const cards = [
    comeback && {
      key: "comeback",
      game: comeback.game,
      label: "Resurgiu das cinzas",
      icon: History,
      badge: formatGapDays(comeback.gapDays),
      meta: `Voltou em ${formatHighlightDate(comeback.returnDate)}`,
    },
    biggestGroup && {
      key: "biggest-group",
      game: biggestGroup.game,
      label: "A galera toda",
      icon: Users,
      badge: `${biggestGroup.playerCount} jogadores`,
      meta: formatHighlightDate(biggestGroup.date),
    },
    champion && {
      key: "champion",
      game: champion.game,
      label: "We are the champions",
      icon: Trophy,
      badge: `${champion.totalZeros} ${champion.totalZeros === 1 ? "zero no grupo" : "zeros no grupo"}`,
      meta: [
        formatHighlightDate(champion.latestZeroDate),
        champion.playerName ? `Zerado por ${champion.playerName}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
  ].filter(Boolean) as Array<{
    key: string
    game: Game
    label: string
    icon: typeof History
    badge: string
    meta: string
  }>

  if (cards.length === 0) {
    return (
      <LandingEmptyState>
        Ainda não há momentos marcantes registrados
      </LandingEmptyState>
    )
  }

  return (
    <div
      className={
        cards.length === 1
          ? "grid grid-cols-1"
          : cards.length === 2
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {cards.map((card) => (
        <HighlightCard
          key={card.key}
          game={card.game}
          label={card.label}
          icon={card.icon}
          badge={card.badge}
          meta={card.meta}
        />
      ))}
    </div>
  )
}
