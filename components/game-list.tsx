"use client"

import type { Game } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Eye, Monitor } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { EditGameDialog } from "@/components/edit-game-dialog"
import { EnrichGameFromIgdb } from "@/components/enrich-game-from-igdb"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"
import Link from "next/link"

interface GameListProps {
  games: Game[]
}

export function GameList({ games }: GameListProps) {
  const router = useRouter()
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogo? Todas as jogatinas relacionadas também serão excluídas."))
      return

    const supabase = createClient()
    const { error } = await supabase.from("games").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting game:", error)
      alert("Erro ao excluir jogo")
    } else {
      router.refresh()
    }
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum jogo cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Jogo" para começar!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="flex h-full flex-col overflow-hidden py-0 hover:shadow-lg transition-shadow">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
              {game.cover_url ? (
                <img
                  src={game.cover_url || "/placeholder.svg"}
                  alt={game.title}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-4xl font-bold opacity-20">{game.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 flex-1">{game.title}</CardTitle>
                {game.is_app && (
                  <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    App
                  </Badge>
                )}
              </div>
              <GameIgdbMetaInline
                game={game}
                variant="line"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adicionado em {new Date(game.created_at).toLocaleDateString("pt-BR")}
              </p>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                  <Link href={`/dashboard/jogos/${game.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Link>
                </Button>
                <EnrichGameFromIgdb game={game} />
                <Button variant="outline" size="sm" onClick={() => setEditingGame(game)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(game.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingGame && (
        <EditGameDialog
          game={editingGame}
          open={!!editingGame}
          onOpenChange={(open) => !open && setEditingGame(null)}
        />
      )}
    </>
  )
}
