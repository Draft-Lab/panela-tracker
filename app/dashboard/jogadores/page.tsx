import { createClient } from "@/lib/supabase/server"
import { PlayerList } from "@/components/player-list"
import { AddPlayerDialog } from "@/components/add-player-dialog"
import type { Player } from "@/lib/types"

export default async function JogadoresPage() {
  const supabase = await createClient()

  const { data: players, error } = await supabase.from("players").select("*").order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching players:", error)
  }

  // Buscar total de minutos jogados por cada jogador
  const { data: jogatinaPlayersData } = await supabase
    .from("jogatina_players")
    .select("player_id, total_duration_minutes")

  const { data: seasonParticipantsData } = await supabase
    .from("season_participants")
    .select("player_id, total_duration_minutes")

  // Calcular total por jogador
  const playerMinutesMap = new Map<string, number>()

  // Somar de jogatina_players
  jogatinaPlayersData?.forEach((jp) => {
    const current = playerMinutesMap.get(jp.player_id) || 0
    playerMinutesMap.set(jp.player_id, current + (jp.total_duration_minutes || 0))
  })

  // Somar de season_participants
  seasonParticipantsData?.forEach((sp) => {
    const current = playerMinutesMap.get(sp.player_id) || 0
    playerMinutesMap.set(sp.player_id, current + (sp.total_duration_minutes || 0))
  })

  // Adicionar total_played_minutes aos jogadores
  const playersWithMinutes: Player[] = (players || []).map((player) => ({
    ...player,
    total_played_minutes: playerMinutesMap.get(player.id) || 0,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Jogadores</h1>
              <p className="text-muted-foreground">Gerencie os perfis dos seus amigos</p>
            </div>
            <AddPlayerDialog />
          </div>

          <PlayerList players={playersWithMinutes} />
        </div>
      </div>
    </div>
  )
}
