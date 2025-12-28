import { createClient } from "@/lib/supabase/server"
import { JogatinaList } from "@/components/jogatina-list"

export default async function JogatinasPage() {
  const supabase = await createClient()

  const { data: jogatinas, error } = await supabase
    .from("jogatinas")
    .select(`
      *,
      game:games(*),
      jogatina_players(
        *,
        player:players(*)
      )
    `)
    .order("date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching jogatinas:", error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Todas as Jogatinas</h1>
        <p className="text-muted-foreground">Histórico completo de sessões</p>
      </div>

      <JogatinaList jogatinas={jogatinas || []} />
    </div>
  )
}
