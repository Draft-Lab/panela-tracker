"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getPlayerCardAccentIndex,
  PLAYER_CARD_ACCENTS,
} from "@/lib/player-card-accent";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import type { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlayerListCardProps {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
}

export function PlayerListCard({
  player,
  onEdit,
  onDelete,
}: PlayerListCardProps) {
  const accent = PLAYER_CARD_ACCENTS[getPlayerCardAccentIndex(player.id)];
  const initials = player.name.substring(0, 2).toUpperCase();
  const totalMinutes = player.total_played_minutes ?? 0;
  const memberSince = new Date(player.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group overflow-hidden rounded-xl border border-border/50 bg-card/30 transition-all hover:border-border hover:bg-card/40">
      <div
        className={cn(
          "relative h-14 overflow-hidden bg-gradient-to-br",
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
            className="object-cover opacity-25 blur-xl saturate-150"
          />
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <div className="-mt-8 mb-4 flex items-end gap-3">
          <Avatar
            className={cn(
              "h-16 w-16 border-4 border-background ring-2",
              accent.ring,
            )}
          >
            <AvatarImage
              src={player.avatar_url || undefined}
              alt={player.name}
            />
            <AvatarFallback className={cn("text-base font-bold", accent.fallback)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pb-0.5">
            <h3 className="truncate text-lg font-bold tracking-tight">
              {player.name}
            </h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              Desde {memberSince}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Tempo total
          </div>
          <p className="mt-0.5 text-xl font-bold tabular-nums">
            {totalMinutes > 0 ? formatPlayerDuration(totalMinutes) : "—"}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 flex-1 border-border/60 bg-background/40"
          >
            <Link href={`/dashboard/jogadores/${player.id}`}>
              <BarChart3 className="h-3.5 w-3.5" />
              Estatísticas
              <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-50" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-border/60 bg-background/40"
            onClick={onEdit}
            aria-label={`Editar ${player.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            aria-label={`Excluir ${player.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
