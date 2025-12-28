import { createClient } from "@/lib/supabase/server"
import { GameRoulette } from "@/components/game-roulette"

export default async function RoletaPage() {
  const supabase = await createClient()
  const { data: games } = await supabase.from("games").select("*").order("title")

  return <GameRoulette games={games || []} />
}
