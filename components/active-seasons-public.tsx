"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Users, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { SeasonWithDetails } from "@/lib/types"

interface ActiveSeasonsPublicProps {
  seasons: SeasonWithDetails[]
}

export function ActiveSeasonsPublic({ seasons }: ActiveSeasonsPublicProps) {
  if (seasons.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Nenhuma temporada ativa no momento</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {seasons.map((season) => {
        const daysActive = Math.floor((Date.now() - new Date(season.started_at).getTime()) / (1000 * 60 * 60 * 24))

        const totalSessions = season.season_participants?.reduce((sum, p) => sum + (p.total_sessions || 0), 0) || 0

        const totalHours = Math.floor(
          (season.season_participants?.reduce((sum, p) => sum + (p.total_duration_minutes || 0), 0) || 0) / 60,
        )

        // Status counts
        const statusCounts = {
          emAndamento: season.season_participants?.filter((p) => p.status === "Em andamento" || !p.status).length || 0,
          dropo: season.season_participants?.filter((p) => p.status === "Dropo").length || 0,
          zero: season.season_participants?.filter((p) => p.status === "Zero").length || 0,
          dava: season.season_participants?.filter((p) => p.status === "Dava pra jogar").length || 0,
        }

        return (
          <Card key={season.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-yellow-500 shrink-0" />
                    <h3 className="font-bold text-lg truncate">{season.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{season.game?.title}</p>
                </div>
                <Badge className="bg-green-500 shrink-0">Ativa</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Season Description */}
              {season.description && <p className="text-sm text-muted-foreground line-clamp-2">{season.description}</p>}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Duração</p>
                    <p className="font-semibold">
                      {daysActive} {daysActive === 1 ? "dia" : "dias"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Jogadores</p>
                    <p className="font-semibold">{season.season_participants?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Sessões</p>
                    <p className="font-semibold">{totalSessions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Tempo total</p>
                    <p className="font-semibold">{totalHours}h</p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {statusCounts.emAndamento > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                    {statusCounts.emAndamento} Em andamento
                  </Badge>
                )}
                {statusCounts.dropo > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                    {statusCounts.dropo} Dropou
                  </Badge>
                )}
                {statusCounts.zero > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    {statusCounts.zero} Zerou
                  </Badge>
                )}
              </div>

              {/* Players Avatars */}
              {season.season_participants && season.season_participants.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="flex -space-x-2">
                    {season.season_participants.slice(0, 5).map((participant) => (
                      <Avatar key={participant.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={participant.player?.avatar_url || undefined} alt={participant.player?.name} />
                        <AvatarFallback className="text-xs">
                          {participant.player?.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {season.season_participants.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                        +{season.season_participants.length - 5}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">participando</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function Gamepad2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 11h4" />
      <path d="M8 9v4" />
      <path d="m15 10 3 3" />
      <path d="m18 10-3 3" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  )
}
