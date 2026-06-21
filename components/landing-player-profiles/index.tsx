import { LandingPlayerProfileCard } from "@/components/landing-player-profiles/player-profile-card"
import type { PlayerAchievement } from "@/lib/player-achievements"
import type { Player } from "@/lib/types"

export interface LandingPlayerCardStats {
  player: Player
  totalSessions: number
  totalMinutes: number
  dropCount: number
  uniqueGames: number
  dropRate: number
  achievements?: PlayerAchievement[]
}

interface LandingPlayerProfilesProps {
  playerStats: LandingPlayerCardStats[]
}

export function LandingPlayerProfiles({
  playerStats,
}: LandingPlayerProfilesProps) {
  const sortedStats = [...playerStats].sort(
    (a, b) => b.totalMinutes - a.totalMinutes,
  )

  if (sortedStats.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
        Nenhum perfil cadastrado ainda.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {sortedStats.map((stat) => (
        <LandingPlayerProfileCard
          key={stat.player.id}
          player={stat.player}
          totalSessions={stat.totalSessions}
          totalMinutes={stat.totalMinutes}
          dropCount={stat.dropCount}
          uniqueGames={stat.uniqueGames}
          dropRate={stat.dropRate}
          achievements={stat.achievements ?? []}
        />
      ))}
    </div>
  )
}
