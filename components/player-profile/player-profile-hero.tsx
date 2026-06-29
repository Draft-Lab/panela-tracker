import type { ReactNode } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { PlayerAchievement } from "@/lib/player-achievements"
import type { PlayerCurrentlyPlaying } from "@/lib/player-profile-helpers"
import { formatPlayerDuration } from "@/lib/player-profile-helpers"
import { PlayerProfilePlayingNow } from "@/components/player-profile/player-profile-playing-now"
import { PlayerProfilePlatinandoNow } from "@/components/player-profile/player-profile-platinando-now"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import { cn } from "@/lib/utils"
import type { Player, PlayerPlatinumGame } from "@/lib/types"

interface PlayerProfileHeroProps {
  player: Player
  achievements?: PlayerAchievement[]
  totalMinutes: number
  totalSessions: number
  uniqueGames: number
  bannerCoverUrl: string | null
  metaExtra?: ReactNode
  actions?: ReactNode
  currentlyPlaying?: PlayerCurrentlyPlaying | null
  platinando?: PlayerPlatinumGame | null
  platinadosCount?: number
}

function AchievementPill({ achievement }: { achievement: PlayerAchievement }) {
  return (
    <span
      title={achievement.description}
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]",
        achievement.style,
      )}
    >
      {achievement.label}
    </span>
  )
}

export function PlayerProfileHero({
  player,
  achievements = [],
  totalMinutes,
  totalSessions,
  uniqueGames,
  bannerCoverUrl,
  metaExtra,
  actions,
  currentlyPlaying = null,
  platinando = null,
  platinadosCount = 0,
}: PlayerProfileHeroProps) {
  const memberSince = new Date(player.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <section className="overflow-hidden rounded-[1.5rem] ring-1 ring-white/10">
      <div className="relative">
        <div className="absolute inset-0 min-h-[6.5rem] sm:min-h-[7.5rem]" aria-hidden>
          {bannerCoverUrl ? (
            <>
              <Image
                src={bannerCoverUrl}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-top brightness-[0.32] saturate-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card/30 to-background" />
          )}
        </div>

        <div className="relative z-10 p-3 sm:p-4">
          <LandingGlassCell innerClassName="p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <Avatar className="h-14 w-14 shrink-0 ring-1 ring-white/15 sm:h-16 sm:w-16">
                  <AvatarImage
                    src={player.avatar_url || undefined}
                    alt={player.name}
                  />
                  <AvatarFallback className="text-base font-semibold">
                    {player.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {player.name}
                    </h1>
                    <span className="text-[10px] text-muted-foreground">
                      desde {memberSince}
                    </span>
                  </div>

                  {(currentlyPlaying || platinando) && (
                    <div className="mt-1 space-y-0.5">
                      {currentlyPlaying && (
                        <PlayerProfilePlayingNow session={currentlyPlaying} />
                      )}
                      {platinando && (
                        <PlayerProfilePlatinandoNow entry={platinando} />
                      )}
                    </div>
                  )}

                  {metaExtra}

                  {(achievements.length > 0 || platinadosCount > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {platinadosCount > 0 && (
                        <span className="inline-flex rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-amber-400">
                          {platinadosCount}{" "}
                          {platinadosCount === 1 ? "platinado" : "platinados"}
                        </span>
                      )}
                      {achievements.map((achievement) => (
                        <AchievementPill
                          key={achievement.id}
                          achievement={achievement}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                <div className="flex divide-x divide-white/[0.08] rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <HeroStat
                    label="Tempo"
                    value={formatPlayerDuration(totalMinutes)}
                  />
                  <HeroStat label="Sessões" value={String(totalSessions)} />
                  <HeroStat label="Jogos" value={String(uniqueGames)} />
                </div>
                {actions}
              </div>
            </div>
          </LandingGlassCell>
        </div>
      </div>
    </section>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-2 text-center sm:px-3">
      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold tabular-nums tracking-tight text-foreground sm:text-sm">
        {value}
      </p>
    </div>
  )
}
