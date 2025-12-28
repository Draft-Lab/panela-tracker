"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface JogatinaPlayer {
  id: string
  player_id: string
  status: "Dropo" | "Zero" | "Dava pra jogar"
  player: {
    id: string
    name: string
    avatar_url?: string
  }
}

interface HallOfShameProps {
  jogatinaPlayers: JogatinaPlayer[]
}

export function HallOfShame({ jogatinaPlayers }: HallOfShameProps) {
  const topDroppers = useMemo(() => {
    const playerMap = new Map<
      string,
      {
        id: string
        name: string
        avatar_url?: string
        totalDrops: number
        totalParticipations: number
        dropRate: number
      }
    >()

    jogatinaPlayers.forEach((jp) => {
      if (!playerMap.has(jp.player_id)) {
        playerMap.set(jp.player_id, {
          id: jp.player_id,
          name: jp.player.name,
          avatar_url: jp.player.avatar_url,
          totalDrops: 0,
          totalParticipations: 0,
          dropRate: 0,
        })
      }

      const player = playerMap.get(jp.player_id)!
      player.totalParticipations++
      if (jp.status === "Dropo") {
        player.totalDrops++
      }
    })

    // Calculate drop rate and sort
    const players = Array.from(playerMap.values())
      .map((p) => ({
        ...p,
        dropRate: p.totalParticipations > 0 ? (p.totalDrops / p.totalParticipations) * 100 : 0,
      }))
      .sort((a, b) => b.totalDrops - a.totalDrops)
      .slice(0, 3)

    return players
  }, [jogatinaPlayers])

  if (topDroppers.length === 0) {
    return null
  }

  const [second, first, third] = [topDroppers[1], topDroppers[0], topDroppers[2]].filter(Boolean)

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <Badge variant="destructive" className="mb-2">
          <Flame className="h-3 w-3 mr-1" />
          Hall da Vergonha
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold">TOP DROPADORES</h2>
        <p className="text-muted-foreground text-lg">Os jogadores que mais abandonaram suas equipes</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
        {/* 2nd Place */}
        {second && (
          <Card className="relative border-2 border-muted-foreground/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-cyan-500/50 mx-auto">
                  <AvatarImage src={second.avatar_url || "/placeholder.svg"} alt={second.name} />
                  <AvatarFallback className="text-2xl">{second.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-cyan-500 text-white border-0">
                  <Trophy className="h-3 w-3 mr-1" />
                  2º Lugar
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{second.name}</h3>
                <div className="text-5xl font-bold text-cyan-500 mb-1">{second.totalDrops}</div>
                <p className="text-sm text-muted-foreground mb-2">drops registrados</p>
                <Badge variant="outline" className="text-cyan-500 border-cyan-500">
                  Taxa: {second.dropRate.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 1st Place - Champion */}
        {first && (
          <Card className="relative border-4 border-destructive bg-gradient-to-br from-destructive/20 to-destructive/5 backdrop-blur md:-mt-8">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-destructive mx-auto ring-4 ring-destructive/20">
                  <AvatarImage src={first.avatar_url || "/placeholder.svg"} alt={first.name} />
                  <AvatarFallback className="text-3xl">{first.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground border-0 text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  CAMPEÃO
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-1">{first.name}</h3>
                <div className="text-7xl font-bold text-destructive mb-1">{first.totalDrops}</div>
                <p className="text-sm text-muted-foreground mb-2">drops registrados</p>
                <Badge variant="destructive" className="text-base px-4 py-1">
                  Taxa: {first.dropRate.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3rd Place */}
        {third && (
          <Card className="relative border-2 border-muted-foreground/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-purple-500/50 mx-auto">
                  <AvatarImage src={third.avatar_url || "/placeholder.svg"} alt={third.name} />
                  <AvatarFallback className="text-2xl">{third.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white border-0">
                  <Trophy className="h-3 w-3 mr-1" />
                  3º Lugar
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{third.name}</h3>
                <div className="text-5xl font-bold text-purple-500 mb-1">{third.totalDrops}</div>
                <p className="text-sm text-muted-foreground mb-2">drops registrados</p>
                <Badge variant="outline" className="text-purple-500 border-purple-500">
                  Taxa: {third.dropRate.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
