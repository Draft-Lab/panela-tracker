import { DropperRankCard } from "@/components/hall-of-shame/dropper-rank-card"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import type { DropperStat } from "@/components/hall-of-shame/dropper-rank-utils"

interface DropperRankPodiumProps {
  topDroppers: DropperStat[]
}

export function DropperRankPodium({ topDroppers }: DropperRankPodiumProps) {
  const [first, second, third] = topDroppers
  const runners = [second, third].filter(Boolean) as DropperStat[]

  if (topDroppers.length === 1) {
    return <DropperRankCard stat={first} rank={1} variant="champion" />
  }

  return (
    <div className="space-y-3">
      <DropperRankCard
        stat={first}
        rank={1}
        variant="champion"
        runnerUp={second}
      />

      {runners.length > 0 && (
        <LandingGlassCell innerClassName="divide-y divide-white/[0.06] p-0">
          {runners.map((stat, index) => (
            <DropperRankCard
              key={stat.playerId}
              stat={stat}
              rank={(index + 2) as 2 | 3}
              variant="row"
            />
          ))}
        </LandingGlassCell>
      )}
    </div>
  )
}
