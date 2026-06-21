import { calculatePlayerStats } from "@/lib/status-helpers"

export type DropperStat = ReturnType<typeof calculatePlayerStats>[number]

export function formatDropRate(stat: DropperStat): string {
  return `${stat.dropoPercentage.toFixed(0)}% das jogatinas`
}

export function formatDropGap(leader: DropperStat, runnerUp: DropperStat): string {
  const gap = leader.dropos - runnerUp.dropos
  if (gap <= 0) return "Empate técnico com o 2º"
  if (gap === 1) return "1 drop à frente do 2º"
  return `${gap} drops à frente do 2º`
}
