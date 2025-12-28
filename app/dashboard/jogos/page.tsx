import { createClient } from "@/lib/supabase/server"
import { GameListWithSearch } from "@/components/game-list-with-search"
import { AddGameDialog } from "@/components/add-game-dialog"

export default async function JogosPage() {
  const supabase = await createClient()

  const { data: games, error } = await supabase.from("games").select("*").order("title", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching games:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Jogos</h1>
              <p className="text-muted-foreground">Gerencie os jogos do seu grupo</p>
            </div>
            <AddGameDialog />
          </div>

          <GameListWithSearch games={games || []} />
        </div>
      </div>
    </div>
  )
}
