"use client"

import type { Game } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { EditGameDialog } from "@/components/edit-game-dialog"
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
          <Card key={game.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {game.cover_url ? (
                <img
                  src={game.cover_url || "/placeholder.svg"}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-4xl font-bold opacity-20">{game.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{game.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Adicionado em {new Date(game.created_at).toLocaleDateString("pt-BR")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                  <Link href={`/dashboard/jogos/${game.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Link>
                </Button>
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
