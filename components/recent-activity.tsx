import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
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
    <Card className="relative group">
      {/* Decorative corner lines */}
      <div className="absolute top-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {jogatinas.map((jogatina, index) => {
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
                className="relative flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Timeline line connector */}
                {index < jogatinas.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-px bg-border/30" />
                )}
                
                {/* Timeline dot - minimalista */}
                <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <p className="font-medium text-foreground hover:text-primary transition-colors">
                    {jogatina.game.title}
                  </p>
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
