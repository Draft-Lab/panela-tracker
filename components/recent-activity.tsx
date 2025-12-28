import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gamepad2 } from "lucide-react"
import type { Jogatina, Game } from "@/lib/types"
import Link from "next/link"

interface RecentActivityProps {
  jogatinas: (Jogatina & { game: Game })[]
}

export function RecentActivity({ jogatinas }: RecentActivityProps) {
  if (jogatinas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhuma atividade recente</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jogatinas.map((jogatina) => {
            const date = new Date(jogatina.date)
            const formattedDate = date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            const formattedTime = date.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <Link
                key={jogatina.id}
                href={`/jogos/${jogatina.game_id}`}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{jogatina.game.title}</p>
                  {jogatina.notes && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{jogatina.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {formattedDate}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formattedTime}
                    </Badge>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
