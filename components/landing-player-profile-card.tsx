import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlayerAchievement } from "@/lib/player-achievements";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/types";

import {
  getPlayerCardAccentIndex,
  PLAYER_CARD_ACCENTS,
} from "@/lib/player-card-accent";

interface LandingPlayerProfileCardProps {
  player: Player;
  totalSessions: number;
  totalMinutes: number;
  dropCount: number;
  achievements?: PlayerAchievement[];
}

export function LandingPlayerProfileCard({
  player,
  totalSessions,
  totalMinutes,
  dropCount,
  achievements = [],
}: LandingPlayerProfileCardProps) {
  const accent = PLAYER_CARD_ACCENTS[getPlayerCardAccentIndex(player.id)];
  const initials = player.name.substring(0, 2).toUpperCase();

  return (
    <article className="group overflow-hidden rounded-xl border border-border/50 bg-card/30 transition-all hover:border-border hover:bg-card/50 hover:shadow-lg hover:shadow-black/20">
      <div
        className={cn(
          "relative h-16 overflow-hidden bg-gradient-to-br",
          accent.header,
        )}
        aria-hidden
      >
        {player.avatar_url && (
          <Image
            src={player.avatar_url}
            alt=""
            fill
            sizes="400px"
            className="object-cover opacity-20 blur-xl saturate-150"
          />
        )}
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-9 mb-4 flex items-end gap-3">
          <Avatar
            className={cn(
              "h-[4.5rem] w-[4.5rem] border-4 border-background ring-2",
              accent.ring,
            )}
          >
            <AvatarImage src={player.avatar_url || undefined} alt={player.name} />
            <AvatarFallback className={cn("text-lg font-bold", accent.fallback)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pb-0.5">
            <h3 className="truncate text-lg font-bold tracking-tight">
              {player.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatPlayerDuration(totalMinutes)} jogados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/40 bg-background/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Sessões</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
              {totalSessions}
            </p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
            <p className="text-xs text-red-400/80">Drops</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-red-400">
              {dropCount}
            </p>
          </div>
        </div>

        {achievements.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {achievements.map((achievement) => (
              <Badge
                key={achievement.id}
                variant="outline"
                title={achievement.description}
                className={cn("text-xs", achievement.style)}
              >
                {achievement.label}
              </Badge>
            ))}
          </div>
        )}

        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-4 w-full border-border/60 bg-background/40 group-hover:border-primary/30 group-hover:bg-primary/5"
        >
          <Link href={`/jogadores/${player.id}`}>
            Ver perfil
            <ArrowUpRight className="ml-auto h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
