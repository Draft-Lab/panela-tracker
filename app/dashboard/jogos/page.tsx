import { createClient } from "@/lib/supabase/server"
import { GameListWithSearch } from "@/components/game-list-with-search"
import { AddGameDialog } from "@/components/add-game-dialog"
import { EnrichAllGamesIgdb } from "@/components/enrich-all-games-igdb"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"

export default async function JogosPage() {
  const supabase = await createClient()

  const { data: games, error } = await supabase.from("games").select("*").order("title", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching games:", error)
  }

  return (
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Jogos"
        description="Gerencie os jogos do seu grupo"
        actions={
          <>
            <EnrichAllGamesIgdb games={games || []} />
            <AddGameDialog />
          </>
        }
      />

      <GameListWithSearch games={games || []} />
    </div>
  )
}
