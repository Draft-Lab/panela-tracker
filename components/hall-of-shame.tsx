"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculatePlayerStats } from "@/lib/status-helpers";
import type { JogatinaPlayer, SeasonParticipant, Player } from "@/lib/types";

interface HallOfShameProps {
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[];
  seasonParticipants?: (SeasonParticipant & { player: Player })[];
}

export function HallOfShame({
  jogatinaPlayers,
  seasonParticipants = [],
}: HallOfShameProps) {
  const topDroppers = useMemo(() => {
    const allStats = calculatePlayerStats(jogatinaPlayers, seasonParticipants);

    return allStats
      .filter((p) => p.totalJogatinas > 0)
      .sort((a, b) => b.dropos - a.dropos)
      .slice(0, 3);
  }, [jogatinaPlayers, seasonParticipants]);

  if (topDroppers.length === 0) {
    return null;
  }

  const [second, first, third] = [
    topDroppers[1],
    topDroppers[0],
    topDroppers[2],
  ].filter(Boolean);

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <Badge variant="destructive" className="mb-2">
          <Flame className="h-3 w-3 mr-1" />
          Hall da Vergonha
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold">TOP DROPADORES</h2>
        <p className="text-muted-foreground text-lg">
          Os jogadores que mais abandonaram suas equipes
        </p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
        {/* 2nd Place */}
        {second && (
          <Card className="relative border-2 border-muted-foreground/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-cyan-500/50 mx-auto">
                  <AvatarImage
                    src={second.avatarUrl || undefined}
                    alt={second.playerName}
                  />
                  <AvatarFallback className="text-2xl">
                    {second.playerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-cyan-500 text-white border-0">
                  <Trophy className="h-3 w-3 mr-1" />
                  2º Lugar
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{second.playerName}</h3>
                <div className="text-5xl font-bold text-cyan-500 mb-1">
                  {second.dropos}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  drops registrados
                </p>
                <Badge
                  variant="outline"
                  className="text-cyan-500 border-cyan-500"
                >
                  Taxa: {second.dropoPercentage.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 1st Place - Champion */}
        {first && (
          <Card className="relative border-4 border-destructive bg-linear-to-br from-destructive/20 to-destructive/5 backdrop-blur md:-mt-8">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-destructive mx-auto ring-4 ring-destructive/20">
                  <AvatarImage
                    src={first.avatarUrl || undefined}
                    alt={first.playerName}
                  />
                  <AvatarFallback className="text-3xl">
                    {first.playerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground border-0 text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  CAMPEÃO
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-1">{first.playerName}</h3>
                <div className="text-7xl font-bold text-destructive mb-1">
                  {first.dropos}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  drops registrados
                </p>
                <Badge variant="destructive" className="text-base px-4 py-1">
                  Taxa: {first.dropoPercentage.toFixed(0)}%
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
                  <AvatarImage
                    src={third.avatarUrl || undefined}
                    alt={third.playerName}
                  />
                  <AvatarFallback className="text-2xl">
                    {third.playerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white border-0">
                  <Trophy className="h-3 w-3 mr-1" />
                  3º Lugar
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{third.playerName}</h3>
                <div className="text-5xl font-bold text-purple-500 mb-1">
                  {third.dropos}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  drops registrados
                </p>
                <Badge
                  variant="outline"
                  className="text-purple-500 border-purple-500"
                >
                  Taxa: {third.dropoPercentage.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
