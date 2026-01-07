"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { calculatePlayerStats } from "@/lib/status-helpers"
import type { JogatinaPlayer, SeasonParticipant, Player } from "@/lib/types"

interface HallOfShameProps {
  jogatinaPlayers: (JogatinaPlayer & { player?: Player })[]
  seasonParticipants?: (SeasonParticipant & { player?: Player })[]
}

export function HallOfShame({ jogatinaPlayers, seasonParticipants = [] }: HallOfShameProps) {
  const topDroppers = useMemo(() => {
    const allStats = calculatePlayerStats(jogatinaPlayers, seasonParticipants)

    return allStats
      .filter((p) => p.totalJogatinas > 0)
      .sort((a, b) => b.dropos - a.dropos)
      .slice(0, 3)
  }, [jogatinaPlayers, seasonParticipants])

  if (topDroppers.length === 0) {
    return null
  }

  const [second, first, third] = [topDroppers[1], topDroppers[0], topDroppers[2]].filter(Boolean)

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-transparent to-red-950/20 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative text-center mb-12 space-y-3">
        <Badge variant="destructive" className="inline-flex mb-2 border-2 border-red-500/50 bg-red-950/50 text-red-200">
          <Flame className="h-4 w-4 mr-2" />
          Hall da Vergonha
        </Badge>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-lg">TOP DROPADORES</h2>
        <p className="text-lg text-red-200/80 font-medium">Os campeões do abandono</p>
      </div>

      {/* Podium section */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-end max-w-4xl mx-auto mb-8">
        {/* 2nd Place - Left */}
        {second && (
          <div className="relative md:order-1 order-2 group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

            <Card className="relative border-2 border-cyan-500/30 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl hover:border-cyan-500/60 transition-all duration-300">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-transparent rounded-full blur-lg" />
                  <Avatar className="h-28 w-28 border-4 border-cyan-500/70 mx-auto ring-4 ring-cyan-500/20 relative">
                    <AvatarImage src={second.avatarUrl || ""} alt={second.playerName} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-cyan-600 to-cyan-700">
                      {second.playerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/50">
                    <Trophy className="h-3 w-3 mr-1" />
                    2º
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{second.playerName}</h3>
                  <div className="text-5xl font-black text-cyan-400 drop-shadow-lg mb-1 mt-2">{second.dropos}</div>
                  <p className="text-sm text-cyan-200/60">drops</p>
                  <div className="mt-3 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 bg-cyan-500/5">
                      {second.dropoPercentage.toFixed(0)}% de taxa
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 1st Place - Center Champion */}
        {first && (
          <div className="relative md:order-2 order-1 group md:scale-110 md:z-10">
            {/* Intense glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-t from-red-600/40 via-red-500/20 to-transparent rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300 animate-pulse" />
            <div className="absolute -inset-1 bg-gradient-to-b from-red-500/30 to-transparent rounded-2xl blur-lg" />

            <Card className="relative border-4 border-red-500/70 bg-gradient-to-b from-slate-900/90 to-red-950/60 backdrop-blur-xl shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300">
              <CardContent className="pt-10 pb-8 text-center space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/50 to-transparent rounded-full blur-2xl animate-pulse" />
                  <Avatar className="h-40 w-40 border-4 border-red-500 mx-auto ring-4 ring-red-500/30 relative">
                    <AvatarImage src={first.avatarUrl || ""} alt={first.playerName} />
                    <AvatarFallback className="text-5xl font-black bg-gradient-to-br from-red-600 to-red-700">
                      {first.playerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-3 -right-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-400 shadow-lg shadow-red-600/70 text-base px-3 py-1">
                    <Trophy className="h-4 w-4 mr-2" />
                    CAMPEÃO
                  </Badge>
                  <Flame className="absolute -top-4 -right-4 h-8 w-8 text-red-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-white drop-shadow-lg">{first.playerName}</h3>
                  <div className="text-7xl font-black text-red-500 drop-shadow-lg mb-2 mt-2 animate-pulse">
                    {first.dropos}
                  </div>
                  <p className="text-sm text-red-200/70 font-semibold">drops registrados</p>
                  <div className="mt-4 p-3 bg-red-600/20 rounded-lg border border-red-500/40">
                    <Badge
                      variant="destructive"
                      className="text-base px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 border border-red-500/50 shadow-lg"
                    >
                      {first.dropoPercentage.toFixed(0)}% de taxa
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3rd Place - Right */}
        {third && (
          <div className="relative md:order-3 order-3 group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-b from-purple-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

            <Card className="relative border-2 border-purple-500/30 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl hover:border-purple-500/60 transition-all duration-300">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-lg" />
                  <Avatar className="h-28 w-28 border-4 border-purple-500/70 mx-auto ring-4 ring-purple-500/20 relative">
                    <AvatarImage src={third.avatarUrl || ""} alt={third.playerName} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-600 to-purple-700">
                      {third.playerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50">
                    <Trophy className="h-3 w-3 mr-1" />
                    3º
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{third.playerName}</h3>
                  <div className="text-5xl font-black text-purple-400 drop-shadow-lg mb-1 mt-2">{third.dropos}</div>
                  <p className="text-sm text-purple-200/60">drops</p>
                  <div className="mt-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Badge variant="outline" className="text-purple-400 border-purple-500/50 bg-purple-500/5">
                      {third.dropoPercentage.toFixed(0)}% de taxa
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="relative h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto max-w-2xl rounded-full" />
    </div>
  )
}
