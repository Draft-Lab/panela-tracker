import Image from "next/image"
import { Gamepad2, Users } from "lucide-react"
import { calculateTopGames, type GameRankingStat } from "@/lib/game-stats-helpers"
import { cn } from "@/lib/utils"
import type { Jogatina, Game, JogatinaPlayer } from "@/lib/types"

interface LandingTopGamesProps {
  jogatinas: (Jogatina & { game: Game })[]
  jogatinaPlayers: JogatinaPlayer[]
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
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50",
        isHero ? "min-h-[240px] lg:min-h-full" : "min-h-[148px]",
        className,
      )}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes={
                isHero
                  ? "(max-width: 1024px) 100vw, 58vw"
                  : "(max-width: 1024px) 100vw, 42vw"
              }
              className={cn(
                "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105",
                isHero
                  ? "blur-md brightness-[0.45] saturate-125"
                  : "blur-sm brightness-[0.35] saturate-110",
              )}
            />
            <div className="absolute inset-0 bg-background/50" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40",
                !isHero && "from-background/95 via-background/35",
              )}
            />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-muted/50 via-card/40 to-background",
              rank === 1 && "from-primary/10 via-card/30",
            )}
          />
        )}
      </div>

      <div
        className={cn(
          "relative z-10 flex h-full flex-col justify-between",
          isHero ? "p-6 sm:p-8" : "p-5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full border font-bold tabular-nums",
              isHero
                ? "h-9 min-w-9 border-primary/30 bg-primary/15 px-3 text-sm text-primary"
                : "h-7 min-w-7 border-border/60 bg-background/60 px-2 text-xs text-muted-foreground backdrop-blur-sm",
            )}
          >
            {rank}
          </span>

          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-white/10 shadow-md",
              isHero ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12",
            )}
          >
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={stat.game.title}
                fill
                sizes={isHero ? "80px" : "48px"}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/80">
                <Gamepad2
                  className={cn(
                    "text-muted-foreground",
                    isHero ? "h-8 w-8" : "h-5 w-5",
                  )}
                  strokeWidth={1.75}
                />
              </div>
            )}
          </div>
        </div>

        <div className={cn("mt-auto", isHero ? "pt-8" : "pt-5")}>
          <h3
            className={cn(
              "line-clamp-2 font-semibold tracking-tight text-foreground",
              isHero ? "text-xl sm:text-2xl" : "text-base",
            )}
          >
            {stat.game.title}
          </h3>

          <div
            className={cn(
              "mt-3 flex flex-wrap items-end gap-x-5 gap-y-2",
              isHero ? "sm:mt-4" : "mt-2.5",
            )}
          >
            <div>
              <p
                className={cn(
                  "font-bold tabular-nums tracking-tight",
                  isHero ? "text-4xl sm:text-5xl" : "text-2xl",
                )}
              >
                {stat.sessions}
              </p>
              <p className="text-xs text-muted-foreground">sessões</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="tabular-nums">
                {stat.participations} participações
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function LandingTopGames({
  jogatinas,
  jogatinaPlayers,
}: LandingTopGamesProps) {
  const topGames = calculateTopGames(jogatinas, jogatinaPlayers, 3)

  if (topGames.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
        Nenhum jogo registrado ainda
      </p>
    )
  }

  const [first, second, third] = topGames

  if (topGames.length === 1) {
    return <GameRankCard stat={first} rank={1} variant="hero" />
  }

  if (topGames.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <GameRankCard stat={first} rank={1} variant="hero" />
        <GameRankCard stat={second} rank={2} variant="compact" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:gap-5 lg:min-h-[360px]">
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
