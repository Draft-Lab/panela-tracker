import { LandingPlayerProfileCard } from "@/components/landing-player-profiles/player-profile-card"
import { LandingEmptyState } from "@/components/landing/landing-glass-cell"
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
      <LandingEmptyState>Nenhum perfil cadastrado ainda.</LandingEmptyState>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
