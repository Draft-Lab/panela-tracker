import { Users } from "lucide-react"
import { calculateTopGames, type GameRankingStat, type JogatinaPlayerRef } from "@/lib/game-stats-helpers"
import { cn } from "@/lib/utils"
import type { Jogatina, Game } from "@/lib/types"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"
import { LandingTopGamesExtended } from "@/components/landing-top-games-extended"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
import { LandingGlassMediaCard } from "@/components/landing/landing-glass-media-card"
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell"

const TOP_GAMES_LIMIT = 20

interface LandingTopGamesProps {
  jogatinas: (Jogatina & { game: Game })[]
  jogatinaPlayers: JogatinaPlayerRef[]
  showExtended?: boolean
}

interface GameRankCardProps {
  stat: GameRankingStat
  rank: 1 | 2 | 3
  variant: "hero" | "compact"
  className?: string
}

function GameRankCard({ stat, rank, variant, className }: GameRankCardProps) {
  const isHero = variant === "hero"
  const coverUrl = stat.game.cover_url

  return (
    <LandingGlassMediaCard
      coverSrc={coverUrl}
      coverAlt={stat.game.title}
      className={className}
      contentClassName={isHero ? "flex h-full flex-col gap-5 p-6" : "flex h-full flex-col gap-4 p-5"}
      minHeight={isHero ? "min-h-[220px]" : "min-h-[160px]"}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          #{rank}
        </span>
        <LandingCoverThumb
          src={coverUrl}
          alt={stat.game.title}
          size={isHero ? "lg" : "md"}
          imageSizes={isHero ? "80px" : "72px"}
        />
      </div>

      <div className="mt-auto space-y-3">
        <div>
          <h3
            className={cn(
              "line-clamp-2 font-semibold tracking-tight text-foreground",
              isHero ? "text-xl md:text-2xl" : "text-base",
            )}
          >
            {stat.game.title}
          </h3>
          <GameIgdbMetaInline
            game={stat.game}
            variant="line"
            className="mt-1.5"
          />
        </div>

        <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
          <div>
            <p
              className={cn(
                "font-semibold tabular-nums tracking-tight",
                isHero ? "text-4xl md:text-5xl" : "text-2xl",
              )}
            >
              {stat.sessions}
            </p>
            <p className="text-xs text-muted-foreground">sessões</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="tabular-nums">
              {stat.participations} participações
            </span>
          </div>
        </div>
      </div>
    </LandingGlassMediaCard>
  )
}

function TopGamesPodium({ topGames }: { topGames: GameRankingStat[] }) {
  const [first, second, third] = topGames

  if (topGames.length === 1) {
    return <GameRankCard stat={first} rank={1} variant="hero" />
  }

  if (topGames.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <GameRankCard stat={first} rank={1} variant="hero" />
        <GameRankCard stat={second} rank={2} variant="compact" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-2">
      <GameRankCard
        stat={first}
        rank={1}
        variant="hero"
        className="lg:col-span-7 lg:row-span-2"
      />
      <GameRankCard
        stat={second!}
        rank={2}
        variant="compact"
        className="lg:col-span-5"
      />
      <GameRankCard
        stat={third!}
        rank={3}
        variant="compact"
        className="lg:col-span-5"
      />
    </div>
  )
}

export function LandingTopGames({
  jogatinas,
  jogatinaPlayers,
  showExtended = true,
}: LandingTopGamesProps) {
  const rankedGames = calculateTopGames(
    jogatinas,
    jogatinaPlayers,
    TOP_GAMES_LIMIT,
  )
  const topGames = rankedGames.slice(0, 3)
  const extendedGames = rankedGames.slice(3)

  if (topGames.length === 0) {
    return (
      <LandingEmptyState>
        Nenhuma sessão em grupo registrada ainda
      </LandingEmptyState>
    )
  }

  return (
    <div className="space-y-3">
      <TopGamesPodium topGames={topGames} />
      {showExtended && extendedGames.length > 0 && (
        <LandingTopGamesExtended games={extendedGames} />
      )}
    </div>
  )
}
