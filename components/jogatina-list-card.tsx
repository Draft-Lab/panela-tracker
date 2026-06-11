"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Calendar,
  Clock,
  Gamepad2,
  Pencil,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JogatinaListPlayers } from "@/components/jogatina-list-players";
import {
  formatJogatinaDate,
  formatJogatinaDuration,
  JOGATINA_SESSION_TYPE_LABELS,
  JOGATINA_SOURCE_LABELS,
} from "@/lib/jogatina-display-helpers";
import type { JogatinaWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JogatinaListCardProps {
  jogatina: JogatinaWithDetails;
  hideGameTitle?: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function JogatinaListCard({
  jogatina,
  hideGameTitle = false,
  canEdit,
  onEdit,
  onDelete,
}: JogatinaListCardProps) {
  const coverUrl = jogatina.game?.cover_url;
  const playerCount = jogatina.jogatina_players?.length ?? 0;
  const duration = formatJogatinaDuration(jogatina.total_duration_minutes);
  const isSolo = jogatina.session_type === "solo";

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 transition-colors hover:border-border hover:bg-card/40">
      {coverUrl && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="800px"
            className="object-cover object-center scale-105 blur-2xl saturate-125"
          />
          <div className="absolute inset-0 bg-card/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/60" />
        </div>
      )}

      <div className="relative flex gap-4 p-4 sm:p-5">
        {!hideGameTitle && (
          <Link
            href={`/dashboard/jogos/${jogatina.game_id}`}
            className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50 shadow-md transition-transform group-hover:scale-[1.02]"
          >
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={jogatina.game?.title || "Jogo"}
                fill
                sizes="72px"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Gamepad2 className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              {!hideGameTitle && (
                <Link
                  href={`/dashboard/jogos/${jogatina.game_id}`}
                  className="block truncate text-lg font-semibold tracking-tight transition-colors hover:text-primary"
                >
                  {jogatina.game?.title || "Jogo desconhecido"}
                </Link>
              )}

              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatJogatinaDate(jogatina.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {playerCount} {playerCount === 1 ? "jogador" : "jogadores"}
                </span>
                {duration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {duration}
                  </span>
                )}
              </p>
            </div>

            <div className="flex shrink-0 gap-1">
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border/60 bg-background/50"
                  onClick={onEdit}
                  aria-label="Editar jogatina"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 border-destructive/30 bg-background/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
                aria-label="Excluir jogatina"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {jogatina.is_current && (
              <Badge
                variant="outline"
                className="border-green-500/40 bg-green-500/10 text-green-400"
              >
                Ao vivo
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                isSolo
                  ? "border-blue-500/35 bg-blue-500/10 text-blue-400"
                  : "border-violet-500/35 bg-violet-500/10 text-violet-400",
              )}
            >
              {JOGATINA_SESSION_TYPE_LABELS[jogatina.session_type]}
            </Badge>
            {jogatina.source === "discord_bot" ? (
              <Badge
                variant="outline"
                className="gap-1 border-border/60 bg-background/40"
              >
                <Bot className="h-3 w-3" />
                {JOGATINA_SOURCE_LABELS[jogatina.source]}
              </Badge>
            ) : (
              <Badge variant="secondary">
                {JOGATINA_SOURCE_LABELS[jogatina.source]}
              </Badge>
            )}
            {jogatina.season_id && (
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                Temporada
              </Badge>
            )}
          </div>

          {jogatina.notes && (
            <p className="mt-2.5 line-clamp-2 text-sm italic text-muted-foreground">
              {jogatina.notes}
            </p>
          )}

          <JogatinaListPlayers jogatina={jogatina} />
        </div>
      </div>
    </article>
  );
}
