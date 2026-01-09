"use client"

import { useState } from "react"
import type { JogatinaWithDetails } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Gamepad2, Users, Edit, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { EditJogatinaDialog } from "@/components/edit-jogatina-dialog"
import type { Player } from "@/lib/types"

interface JogatinaListProps {
  jogatinas: JogatinaWithDetails[]
  allPlayers?: Player[]
}

const statusColors = {
  Jogatina: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Dropo: "bg-red-500/10 text-red-500 border-red-500/20",
  Zero: "bg-green-500/10 text-green-500 border-green-500/20",
  "Dava pra jogar": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
}

const sourceLabels = {
  manual: "Manual",
  discord_bot: "Bot Discord",
}

const sessionTypeLabels = {
  solo: "Solo",
  group: "Grupo",
}

export function JogatinaList({ jogatinas, allPlayers = [] }: JogatinaListProps) {
  const router = useRouter()
  const [editingJogatina, setEditingJogatina] = useState<JogatinaWithDetails | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta jogatina?")) return

    const supabase = createClient()
    const { error } = await supabase.from("jogatinas").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting jogatina:", error)
      alert("Erro ao excluir jogatina")
    } else {
      router.refresh()
    }
  }

  if (jogatinas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma jogatina registrada ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">Clique em "Nova Jogatina" para começar!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {jogatinas.map((jogatina) => {
          const canEdit = !jogatina.season_id // Só pode editar se não pertencer a temporada

          return (
            <Card key={jogatina.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Título com jogo */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{jogatina.game?.title || "Jogo desconhecido"}</CardTitle>
                      {jogatina.season_id && (
                        <Badge variant="outline" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Temporada
                        </Badge>
                      )}
                    </div>

                    {/* Data e metadados */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(jogatina.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {jogatina.jogatina_players?.length || 0}{" "}
                        {jogatina.jogatina_players?.length === 1 ? "jogador" : "jogadores"}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {sessionTypeLabels[jogatina.session_type]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sourceLabels[jogatina.source]}
                      </Badge>
                    </div>

                    {/* Notes */}
                    {jogatina.notes && <p className="text-sm text-muted-foreground italic">{jogatina.notes}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => setEditingJogatina(jogatina)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(jogatina.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jogatina.jogatina_players?.map((jp) => (
                    <div key={jp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={jp.player.avatar_url || undefined} alt={jp.player.name} />
                          <AvatarFallback>{jp.player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{jp.player.name}</p>
                          {jp.notes && <p className="text-xs text-muted-foreground">{jp.notes}</p>}
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[jp.status]}>
                        {jp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editingJogatina && (
        <EditJogatinaDialog
          jogatina={editingJogatina}
          allPlayers={allPlayers}
          open={!!editingJogatina}
          onOpenChange={(open) => !open && setEditingJogatina(null)}
        />
      )}
    </>
  )
}
