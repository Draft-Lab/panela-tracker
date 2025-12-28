import { createClient } from "@/lib/supabase/server"
import { AddCurrentGameDialog } from "@/components/add-current-game-dialog"
import { ManageCurrentGames } from "@/components/manage-current-games"

export default async function JogosAtuaisPage() {
  const supabase = await createClient()

  const { data: currentJogatinas } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(
        *,
        player:players(*)
      )
    `,
    )
    .eq("is_current", true)
    .order("date", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jogos Atuais</h1>
          <p className="text-muted-foreground mt-1">Gerencie os jogos que estão sendo jogados agora</p>
        </div>
        <AddCurrentGameDialog />
      </div>

      <ManageCurrentGames currentJogatinas={currentJogatinas || []} />
    </div>
  )
}
