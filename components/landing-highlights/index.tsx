import type { ReactNode } from "react"
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

type HighlightItem = {
  key: string
  node: (variant: "featured" | "compact") => ReactNode
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
      node: (variant: "featured" | "compact") => (
        <HighlightCard
          game={comeback.game}
          label="Resurgiu das cinzas"
          icon={History}
          badge={formatGapDays(comeback.gapDays)}
          meta={`Voltou em ${formatHighlightDate(comeback.returnDate)}`}
          variant={variant}
        />
      ),
    },
    biggestGroup && {
      key: "biggest-group",
      node: (variant: "featured" | "compact") => (
        <HighlightCard
          game={biggestGroup.game}
          label="A galera toda"
          icon={Users}
          badge={`${biggestGroup.playerCount} jogadores`}
          meta={formatHighlightDate(biggestGroup.date)}
          variant={variant}
        />
      ),
    },
    champion && {
      key: "champion",
      node: (variant: "featured" | "compact") => (
        <HighlightCard
          game={champion.game}
          label="We are the champions"
          icon={Trophy}
          badge={`${champion.totalZeros} ${champion.totalZeros === 1 ? "zero no grupo" : "zeros no grupo"}`}
          meta={[
            formatHighlightDate(champion.latestZeroDate),
            champion.playerName ? `Zerado por ${champion.playerName}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          variant={variant}
        />
      ),
    },
  ].filter(Boolean) as HighlightItem[]

  if (cards.length === 0) {
    return (
      <LandingEmptyState>
        Ainda não há momentos marcantes registrados
      </LandingEmptyState>
    )
  }

  if (cards.length === 1) {
    return <div>{cards[0].node("featured")}</div>
  }

  const [featured, ...rest] = cards

  return (
    <div className="space-y-3">
      {featured.node("featured")}
      <div
        className={
          rest.length === 1
            ? "grid grid-cols-1"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        }
      >
        {rest.map((card) => (
          <div key={card.key}>{card.node("compact")}</div>
        ))}
      </div>
    </div>
  )
}
