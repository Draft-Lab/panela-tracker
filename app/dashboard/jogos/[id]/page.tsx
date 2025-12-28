import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { JogatinaList } from "@/components/jogatina-list"
import { AddJogatinaDialog } from "@/components/add-jogatina-dialog"

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  console.log("[v0] Raw params:", params)
  const resolvedParams = await params
  console.log("[v0] Resolved params:", resolvedParams)
  const { id } = resolvedParams
  console.log("[v0] Extracted id:", id)

  const supabase = await createClient()

  const { data: game, error: gameError } = await supabase.from("games").select("*").eq("id", id).single()

  console.log("[v0] Game query result:", { game, gameError })

  if (gameError || !game) {
    notFound()
  }

  const { data: jogatinas, error: jogatinaError } = await supabase
    .from("jogatinas")
    .select(`
      *,
      game:games(*),
      jogatina_players(
        *,
        player:players(*)
      )
    `)
    .eq("game_id", id)
    .order("date", { ascending: false })

  if (jogatinaError) {
    console.error("[v0] Error fetching jogatinas:", jogatinaError)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/jogos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Jogos
            </Link>
          </Button>

          <div className="flex items-start gap-6">
            <div className="w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {game.cover_url ? (
                <img
                  src={game.cover_url || "/placeholder.svg"}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-6xl font-bold opacity-20">{game.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{game.title}</h1>
              <p className="text-muted-foreground mb-6">
                Adicionado em {new Date(game.created_at).toLocaleDateString("pt-BR")}
              </p>
              <AddJogatinaDialog gameId={game.id} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Jogatinas</h2>
          <JogatinaList jogatinas={jogatinas || []} />
        </div>
      </div>
    </div>
  )
}
