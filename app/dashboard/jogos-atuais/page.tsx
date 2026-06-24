import { createClient } from "@/lib/supabase/server"
import { AddGameButton } from "@/components/add-game-button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
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
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Jogos atuais"
        description="Gerencie os jogos que estão sendo jogados agora"
        actions={<AddGameButton />}
      />

      <LandingCurrentGamesSection currentGames={formattedJogatinas} isInteractive={true} />
    </div>
  )
}
