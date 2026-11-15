import { createClient } from "@/lib/supabase/server"
import { AddGameButton } from "@/components/add-game-button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { LandingCurrentGamesSection } from "@/components/landing-current-games-section"
import { fetchCurrentJogatinas } from "@/lib/fetch-current-jogatinas"

export default async function JogosAtuaisPage() {
  const supabase = await createClient()
  const formattedJogatinas = await fetchCurrentJogatinas(
    supabase as unknown as Parameters<typeof fetchCurrentJogatinas>[0],
  )

  return (
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Jogos atuais"
        description="Gerencie os jogos que estão sendo jogados agora"
        actions={<AddGameButton />}
      />

      <LandingCurrentGamesSection
        currentGames={formattedJogatinas}
        isInteractive={true}
      />
    </div>
  )
}
