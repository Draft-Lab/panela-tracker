"use client"

import type { JogatinaWithDetails } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface JogatinaListProps {
  jogatinas: JogatinaWithDetails[]
}

const statusColors = {
  Dropo: "bg-red-500/10 text-red-500 border-red-500/20",
  Zero: "bg-green-500/10 text-green-500 border-green-500/20",
  "Dava pra jogar": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
}

export function JogatinaList({ jogatinas }: JogatinaListProps) {
  const router = useRouter()

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
    <div className="space-y-4">
      {jogatinas.map((jogatina) => (
        <Card key={jogatina.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {new Date(jogatina.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardTitle>
                {jogatina.notes && <p className="text-sm text-muted-foreground">{jogatina.notes}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(jogatina.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jogatina.jogatina_players.map((jp) => (
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
      ))}
    </div>
  )
}
