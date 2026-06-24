import { DropperRankCard } from "@/components/hall-of-shame/dropper-rank-card"
import type { DropperStat } from "@/components/hall-of-shame/dropper-rank-utils"

interface DropperRankPodiumProps {
  topDroppers: DropperStat[]
}

export function DropperRankPodium({ topDroppers }: DropperRankPodiumProps) {
  const [first, second, third] = topDroppers

  if (topDroppers.length === 1) {
    return <DropperRankCard stat={first} rank={1} variant="hero" />
  }

  if (topDroppers.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DropperRankCard stat={first} rank={1} variant="hero" runnerUp={second} />
        <DropperRankCard stat={second} rank={2} variant="compact" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-2">
      <DropperRankCard
        stat={first}
        rank={1}
        variant="hero"
        runnerUp={second}
        className="lg:col-span-7 lg:row-span-2"
      />
      <DropperRankCard
        stat={second!}
        rank={2}
        variant="compact"
        className="lg:col-span-5"
      />
      <DropperRankCard
        stat={third!}
        rank={3}
        variant="compact"
        className="lg:col-span-5"
      />
    </div>
  )
}
