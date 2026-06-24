import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { PlayerAchievement } from "@/lib/player-achievements"
import type { PlayerCurrentlyPlaying } from "@/lib/player-profile-helpers"
import { formatPlayerDuration } from "@/lib/player-profile-helpers"
import { PlayerProfilePlayingNow } from "@/components/player-profile/player-profile-playing-now"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import { cn } from "@/lib/utils"
import type { Player } from "@/lib/types"

interface PlayerProfileHeroProps {
  player: Player
  achievements?: PlayerAchievement[]
  totalMinutes: number
  totalSessions: number
  uniqueGames: number
  bannerCoverUrl: string | null
  backHref?: string
  backLabel?: string
  metaExtra?: ReactNode
  actions?: ReactNode
  currentlyPlaying?: PlayerCurrentlyPlaying | null
}

function AchievementPill({ achievement }: { achievement: PlayerAchievement }) {
  return (
    <span
      title={achievement.description}
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
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
  backHref = "/#perfis",
  backLabel = "Voltar aos perfis",
  metaExtra,
  actions,
  currentlyPlaying = null,
}: PlayerProfileHeroProps) {
  const memberSince = new Date(player.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <section className="overflow-hidden rounded-[2rem] ring-1 ring-white/10">
      <div className="relative">
        <div className="absolute inset-0 min-h-[11rem] sm:min-h-[13rem]" aria-hidden>
          {bannerCoverUrl ? (
            <>
              <Image
                src={bannerCoverUrl}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-top brightness-[0.38] saturate-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/20 to-background/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card/40 to-background" />
          )}
        </div>

        <div className="relative z-10 flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={backHref}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/55 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-md",
                "transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-background/75 active:scale-[0.98]",
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              {backLabel}
            </Link>

            <p className="rounded-full border border-white/10 bg-background/45 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
              Membro desde {memberSince}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-5">
            <LandingGlassCell innerClassName="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div
                    className="absolute -inset-1 rounded-full bg-primary/20 blur-md"
                    aria-hidden
                  />
                  <Avatar className="relative h-20 w-20 ring-2 ring-white/15 sm:h-24 sm:w-24">
                    <AvatarImage
                      src={player.avatar_url || undefined}
                      alt={player.name}
                    />
                    <AvatarFallback className="text-xl font-semibold">
                      {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {player.name}
                  </h1>

                  {currentlyPlaying && (
                    <div className="mt-1.5">
                      <PlayerProfilePlayingNow session={currentlyPlaying} />
                    </div>
                  )}

                  {metaExtra}

                  {achievements.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
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
            </LandingGlassCell>

            <div className="flex flex-col gap-3 lg:min-w-[17rem]">
              <LandingGlassCell innerClassName="p-0">
                <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
                  <HeroStat
                    label="Tempo total"
                    value={formatPlayerDuration(totalMinutes)}
                  />
                  <HeroStat
                    label="Sessões"
                    value={String(totalSessions)}
                  />
                  <HeroStat label="Jogos" value={String(uniqueGames)} />
                </div>
              </LandingGlassCell>
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-3 text-center sm:px-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold tabular-nums tracking-tight text-foreground sm:text-base">
        {value}
      </p>
    </div>
  )
}
