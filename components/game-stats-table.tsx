"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface Jogatina {
  id: string
  game_id: string
  game?: {
    id: string
    title: string
  }
}

interface JogatinaPlayerWithGame {
  id: string
  status: "Dropo" | "Zero" | "Dava pra jogar"
  jogatina: {
    id: string
    game_id: string
    game?: {
      id: string
      title: string
    }
  }
}

interface GameStatsTableProps {
  jogatinas: Jogatina[]
  jogatinaPlayers: JogatinaPlayerWithGame[]
}

interface GameStats {
  gameId: string
  gameTitle: string
  totalJogatinas: number
  totalParticipations: number
  dropos: number
  zeros: number
  davaPraJogar: number
}

export function GameStatsTable({ jogatinas, jogatinaPlayers }: GameStatsTableProps) {
  const stats = useMemo(() => {
    const gameMap = new Map<string, GameStats>()

    // Initialize with jogatinas count
    jogatinas.forEach((jogatina) => {
      if (!gameMap.has(jogatina.game_id)) {
        gameMap.set(jogatina.game_id, {
          gameId: jogatina.game_id,
          gameTitle: jogatina.game?.title || `Jogo ID: ${jogatina.game_id.substring(0, 8)}...`,
          totalJogatinas: 0,
          totalParticipations: 0,
          dropos: 0,
          zeros: 0,
          davaPraJogar: 0,
        })
      }
      gameMap.get(jogatina.game_id)!.totalJogatinas++
    })

    // Add player stats
    jogatinaPlayers.forEach((jp) => {
      const gameId = jp.jogatina.game_id
      const gameTitle = jp.jogatina.game?.title || `Jogo ID: ${gameId.substring(0, 8)}...`

      if (!gameMap.has(gameId)) {
        gameMap.set(gameId, {
          gameId,
          gameTitle,
          totalJogatinas: 0,
          totalParticipations: 0,
          dropos: 0,
          zeros: 0,
          davaPraJogar: 0,
        })
      }

      const stats = gameMap.get(gameId)!
      // Update title if we have it from jogatinaPlayers but not from jogatinas
      if (jp.jogatina.game?.title && stats.gameTitle.startsWith("Jogo ID:")) {
        stats.gameTitle = jp.jogatina.game.title
      }
      stats.totalParticipations++

      if (jp.status === "Dropo") stats.dropos++
      else if (jp.status === "Zero") stats.zeros++
      else if (jp.status === "Dava pra jogar") stats.davaPraJogar++
    })

    return Array.from(gameMap.values()).sort((a, b) => b.totalJogatinas - a.totalJogatinas)
  }, [jogatinas, jogatinaPlayers])

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
    <Card className="relative group flex flex-col h-[600px]">
      {/* Decorative corner lines */}
      <div className="absolute top-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-4 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-px h-4 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Jogo</TableHead>
                <TableHead className="text-center">Jogatinas</TableHead>
                <TableHead className="text-center">Participações</TableHead>
                <TableHead className="text-center">Dropos</TableHead>
                <TableHead className="text-center">Zeros</TableHead>
                <TableHead className="text-center">Dava pra Jogar</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.gameId}>
                  <TableCell className="font-medium">{stat.gameTitle}</TableCell>
                  <TableCell className="text-center">{stat.totalJogatinas}</TableCell>
                  <TableCell className="text-center">{stat.totalParticipations}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-destructive font-semibold">{stat.dropos}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-success font-semibold">{stat.zeros}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-warning font-semibold">{stat.davaPraJogar}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/jogos/${stat.gameId}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
