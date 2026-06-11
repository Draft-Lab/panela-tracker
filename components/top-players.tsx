import Link from "next/link";
import { ArrowUpRight, Award, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { calculatePlayerStats } from "@/lib/status-helpers";
import type { JogatinaPlayer, SeasonParticipant, Player } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopPlayersProps {
  jogatinaPlayers: (JogatinaPlayer & { player: Player })[];
  seasonParticipants?: (SeasonParticipant & { player: Player })[];
  className?: string;
}

export function TopPlayers({
  jogatinaPlayers,
  seasonParticipants = [],
  className,
}: TopPlayersProps) {
  const topPlayers = calculatePlayerStats(jogatinaPlayers, seasonParticipants)
    .sort((a, b) => b.totalJogatinas - a.totalJogatinas)
    .slice(0, 5);

  if (topPlayers.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Nenhum jogador registrado ainda
      </div>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-border/50 overflow-hidden rounded-xl border border-border/50 bg-card/30",
        className,
      )}
    >
      {topPlayers.map((stat, index) => (
        <Link
          key={stat.playerId}
          href={`/dashboard/jogadores/${stat.playerId}`}
          className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/30 sm:px-5"
        >
          <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
            {index + 1}
          </span>

          <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/50">
            <AvatarImage
              src={stat.avatarUrl || undefined}
              alt={stat.playerName}
            />
            <AvatarFallback className="text-xs">
              {stat.playerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground group-hover:text-primary">
              {stat.playerName}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
                <TrendingDown className="h-3 w-3 text-destructive" />
                {stat.dropos} drops
              </Badge>
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
                <Award className="h-3 w-3 text-success" />
                {stat.zeros} zeros
              </Badge>
              {stat.dropoPercentage > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tabular-nums">
                  {stat.dropoPercentage}% drop
                </Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-bold tabular-nums">{stat.totalJogatinas}</p>
              <p className="text-[10px] text-muted-foreground">jogatinas</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </Link>
      ))}
    </div>
  );
}
