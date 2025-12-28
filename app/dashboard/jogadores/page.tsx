import { createClient } from "@/lib/supabase/server"
import { PlayerList } from "@/components/player-list"
import { AddPlayerDialog } from "@/components/add-player-dialog"

export default async function JogadoresPage() {
  const supabase = await createClient()

  const { data: players, error } = await supabase.from("players").select("*").order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching players:", error)
  }

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

          <PlayerList players={players || []} />
        </div>
      </div>
    </div>
  )
}
