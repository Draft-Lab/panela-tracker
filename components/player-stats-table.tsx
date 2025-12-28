"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface JogatinaPlayerWithDetails {
  id: string
  status: "Dropo" | "Zero" | "Dava pra jogar"
  player: {
    id: string
    name: string
    avatar_url: string | null
  }
}

interface PlayerStatsTableProps {
  jogatinaPlayers: JogatinaPlayerWithDetails[]
}

interface PlayerStats {
  playerId: string
  playerName: string
  avatarUrl: string | null
  totalJogatinas: number
  dropos: number
  zeros: number
  davaPraJogar: number
  dropoPercentage: number
}

export function PlayerStatsTable({ jogatinaPlayers }: PlayerStatsTableProps) {
  const stats = useMemo(() => {
    const playerMap = new Map<string, PlayerStats>()

    jogatinaPlayers.forEach((jp) => {
      const playerId = jp.player.id

      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          playerId,
          playerName: jp.player.name,
          avatarUrl: jp.player.avatar_url,
          totalJogatinas: 0,
          dropos: 0,
          zeros: 0,
          davaPraJogar: 0,
          dropoPercentage: 0,
        })
      }

      const stats = playerMap.get(playerId)!
      stats.totalJogatinas++

      if (jp.status === "Dropo") stats.dropos++
      else if (jp.status === "Zero") stats.zeros++
      else if (jp.status === "Dava pra jogar") stats.davaPraJogar++
    })

    // Calculate percentages and sort by dropos
    const statsArray = Array.from(playerMap.values()).map((stat) => ({
      ...stat,
      dropoPercentage: stat.totalJogatinas > 0 ? (stat.dropos / stat.totalJogatinas) * 100 : 0,
    }))

    return statsArray.sort((a, b) => b.dropos - a.dropos)
  }, [jogatinaPlayers])

  if (stats.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma estatística disponível ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Total de Jogatinas</TableHead>
              <TableHead className="text-center">Dropos</TableHead>
              <TableHead className="text-center">Zeros</TableHead>
              <TableHead className="text-center">Dava pra Jogar</TableHead>
              <TableHead className="text-center">% Dropo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat, index) => (
              <TableRow key={stat.playerId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {index === 0 && stat.dropos > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Dropador
                      </Badge>
                    )}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={stat.avatarUrl || undefined} alt={stat.playerName} />
                      <AvatarFallback>{stat.playerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{stat.playerName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{stat.totalJogatinas}</TableCell>
                <TableCell className="text-center">
                  <span className="text-red-500 font-semibold">{stat.dropos}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-green-500 font-semibold">{stat.zeros}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-yellow-500 font-semibold">{stat.davaPraJogar}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={stat.dropoPercentage > 50 ? "text-red-500 font-bold" : ""}>
                    {stat.dropoPercentage.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
