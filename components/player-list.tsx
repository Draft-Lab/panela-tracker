"use client"

import type { Player } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { EditPlayerDialog } from "@/components/edit-player-dialog"
import Link from "next/link"

interface PlayerListProps {
  players: Player[]
}

export function PlayerList({ players }: PlayerListProps) {
  const router = useRouter()
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogador?")) return

    const supabase = createClient()
    const { error } = await supabase.from("players").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting player:", error)
      alert("Erro ao excluir jogador")
    } else {
      router.refresh()
    }
  }

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum jogador cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Jogador" para começar!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={player.avatar_url || undefined} alt={player.name} />
                  <AvatarFallback className="text-lg">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{player.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Desde {new Date(player.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  {player.total_played_minutes !== undefined && player.total_played_minutes > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Total jogado: {Math.floor(player.total_played_minutes / 60)}h {player.total_played_minutes % 60}m
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => setEditingPlayer(player)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/jogadores/${player.id}`}>
                    <BarChart3 className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(player.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPlayer && (
        <EditPlayerDialog
          player={editingPlayer}
          open={!!editingPlayer}
          onOpenChange={(open) => !open && setEditingPlayer(null)}
        />
      )}
    </>
  )
}
