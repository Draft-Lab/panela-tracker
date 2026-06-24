import { createClient } from "@/lib/supabase/server"
import { PlayerList } from "@/components/player-list"
import { AddPlayerDialog } from "@/components/add-player-dialog"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { fetchPlayerAggregateStatsMap } from "@/lib/fetch-all-jogatina-players"
import type { Player } from "@/lib/types"

export default async function JogadoresPage() {
  const supabase = await createClient()

  const { data: players, error } = await supabase.from("players").select("*").order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching players:", error)
  }

  let playerMinutesMap = new Map<string, { totalMinutes: number; totalSessions: number }>()

  try {
    playerMinutesMap = await fetchPlayerAggregateStatsMap(supabase)
  } catch (statsError) {
    console.error("[JogadoresPage] Error fetching player stats:", statsError)
  }

  const playersWithMinutes: Player[] = (players || []).map((player) => ({
    ...player,
    total_played_minutes: playerMinutesMap.get(player.id)?.totalMinutes || 0,
  }))

  return (
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Jogadores"
        description="Gerencie os perfis e acompanhe o tempo de cada um"
        actions={<AddPlayerDialog />}
      />

      <PlayerList players={playersWithMinutes} />
    </div>
  )
}
