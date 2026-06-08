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
  variant?: "default" | "compact"
  hideGameTitle?: boolean
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

function JogatinaMeta({
  jogatina,
}: {
  jogatina: JogatinaWithDetails
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {new Date(jogatina.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      <span className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        {jogatina.jogatina_players?.length || 0}
      </span>
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
        {sessionTypeLabels[jogatina.session_type]}
      </Badge>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
        {sourceLabels[jogatina.source]}
      </Badge>
      {jogatina.season_id && (
        <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
          <Trophy className="h-3 w-3" />
          Temporada
        </Badge>
      )}
    </div>
  )
}

function JogatinaPlayers({
  jogatina,
  compact = false,
}: {
  jogatina: JogatinaWithDetails
  compact?: boolean
}) {
  return (
    <div className={compact ? "mt-3 space-y-2" : "space-y-3"}>
      {jogatina.jogatina_players?.map((jp) => (
        <div
          key={jp.id}
          className={
            compact
              ? "flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-2"
              : "flex items-center justify-between rounded-lg bg-muted/50 p-3"
          }
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
              <AvatarImage src={jp.player.avatar_url || undefined} alt={jp.player.name} />
              <AvatarFallback>{jp.player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className={compact ? "truncate text-sm font-medium" : "font-medium"}>
                {jp.player.name}
              </p>
              {jp.notes && (
                <p className="truncate text-xs text-muted-foreground">{jp.notes}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`shrink-0 ${statusColors[jp.status]}`}>
            {jp.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}

export function JogatinaList({
  jogatinas,
  allPlayers = [],
  variant = "default",
  hideGameTitle = false,
}: JogatinaListProps) {
  const router = useRouter()
  const [editingJogatina, setEditingJogatina] = useState<JogatinaWithDetails | null>(null)
  const isCompact = variant === "compact"

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
      <div className={isCompact ? "py-10 text-center" : undefined}>
        {isCompact ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nenhuma jogatina registrada.</p>
            <p className="text-xs text-muted-foreground">
              Use o botão acima para registrar a primeira sessão.
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma jogatina registrada ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Nova Jogatina" para começar!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderActions = (jogatina: JogatinaWithDetails, canEdit: boolean) => (
    <div className="flex shrink-0 gap-1">
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setEditingJogatina(jogatina)}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleDelete(jogatina.id)}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  )

  return (
    <>
      {isCompact ? (
        <div className="divide-y divide-border/60">
          {jogatinas.map((jogatina) => {
            const canEdit = !jogatina.season_id

            return (
              <article key={jogatina.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    {!hideGameTitle && (
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        <p className="truncate font-medium">
                          {jogatina.game?.title || "Jogo desconhecido"}
                        </p>
                      </div>
                    )}
                    <JogatinaMeta jogatina={jogatina} />
                    {jogatina.notes && (
                      <p className="text-xs italic text-muted-foreground line-clamp-2">
                        {jogatina.notes}
                      </p>
                    )}
                  </div>
                  {renderActions(jogatina, canEdit)}
                </div>
                <JogatinaPlayers jogatina={jogatina} compact />
              </article>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {jogatinas.map((jogatina) => {
            const canEdit = !jogatina.season_id

            return (
              <Card key={jogatina.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {!hideGameTitle && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Gamepad2 className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">
                            {jogatina.game?.title || "Jogo desconhecido"}
                          </CardTitle>
                          {jogatina.season_id && (
                            <Badge variant="outline" className="gap-1">
                              <Trophy className="h-3 w-3" />
                              Temporada
                            </Badge>
                          )}
                        </div>
                      )}

                      <JogatinaMeta jogatina={jogatina} />

                      {jogatina.notes && (
                        <p className="text-sm text-muted-foreground italic">{jogatina.notes}</p>
                      )}
                    </div>

                    {renderActions(jogatina, canEdit)}
                  </div>
                </CardHeader>
                <CardContent>
                  <JogatinaPlayers jogatina={jogatina} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

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
