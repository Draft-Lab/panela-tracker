import { createClient } from "@/lib/supabase/server"
import { AddGameButton } from "@/components/add-game-button"
import { LandingCurrentGamesSection } from "@/components/landing-current-games-section"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"

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

  const formattedJogatinas = (currentJogatinas || []).map((jogatina) => ({
    ...jogatina,
    game: jogatina.game as Game,
    jogatina_players: jogatina.jogatina_players as (JogatinaPlayer & { player: Player })[],
  })) as (Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  })[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jogos Atuais</h1>
          <p className="text-muted-foreground mt-1">Gerencie os jogos que estão sendo jogados agora</p>
        </div>
        <AddGameButton />
      </div>

      <LandingCurrentGamesSection currentGames={formattedJogatinas} isInteractive={true} />
    </div>
  )
}
