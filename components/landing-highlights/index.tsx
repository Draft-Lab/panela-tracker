import { History, Trophy, Users } from "lucide-react"
import { MomentsBoard, type MomentRecord } from "@/components/landing-highlights/moments-board"
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
      label: "Maior retorno",
      icon: History,
      badge: formatGapDays(comeback.gapDays),
      meta: `Voltou em ${formatHighlightDate(comeback.returnDate)}`,
    },
    biggestGroup && {
      key: "biggest-group",
      game: biggestGroup.game,
      label: "Maior sessão em grupo",
      icon: Users,
      badge: `${biggestGroup.playerCount} jogadores`,
      meta: formatHighlightDate(biggestGroup.date),
    },
    champion && {
      key: "champion",
      game: champion.game,
      label: "Último jogo zerado",
      icon: Trophy,
      badge: champion.playerName ? `Zerado por ${champion.playerName}` : "Jogo zerado",
      meta: formatHighlightDate(champion.latestZeroDate),
    },
  ].filter(Boolean) as MomentRecord[]

  if (cards.length === 0) {
    return (
      <LandingEmptyState>
        Ainda não há momentos marcantes registrados
      </LandingEmptyState>
    )
  }

  return <MomentsBoard moments={cards} />
}
