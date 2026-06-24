"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Gamepad2,
  Pencil,
  Trophy,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatSeasonDate,
  formatSeasonPlaytime,
  getSeasonDaysActive,
  getSeasonTotalMinutes,
  SEASON_PARTICIPANT_STATUS_STYLES,
} from "@/lib/season-display-helpers";
import type { SeasonWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import { glassInnerFlush, glassOuter } from "@/lib/glass-styles";

interface SeasonListCardProps {
  season: SeasonWithDetails;
  featured?: boolean;
  onEdit?: () => void;
  onFinish?: () => void;
}

export function SeasonListCard({
  season,
  featured = false,
  onEdit,
  onFinish,
}: SeasonListCardProps) {
  const coverUrl = season.game?.cover_url;
  const daysActive = getSeasonDaysActive(season);
  const totalMinutes = getSeasonTotalMinutes(season);
  const participants = season.season_participants ?? [];
  const participantCount = participants.length;
  const visibleAvatars = participants.slice(0, featured ? 6 : 5);

  return (
    <article
      className={cn(
        "group relative overflow-hidden",
        glassOuter,
        featured && "lg:flex lg:min-h-[220px]",
      )}
    >
      <div className={cn(glassInnerFlush, "relative transition-colors hover:bg-card/60", featured && "lg:flex lg:min-h-[220px] lg:w-full")}>
      {coverUrl && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes={featured ? "1200px" : "600px"}
            className="object-cover object-center scale-105 blur-2xl saturate-125"
          />
          <div className="absolute inset-0 bg-card/90" />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/55",
              featured && "lg:bg-gradient-to-br lg:from-card lg:via-card/80 lg:to-card/40",
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "relative flex gap-4 p-4 sm:p-5",
          featured ? "flex-col sm:flex-row lg:flex-1" : "flex-col sm:flex-row",
        )}
      >
        <Link
          href={`/dashboard/temporadas/${season.id}`}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50 shadow-md transition-transform group-hover:scale-[1.02]",
            featured ? "h-40 w-full sm:h-44 sm:w-32 lg:h-auto lg:w-36" : "h-32 w-full sm:h-36 sm:w-28",
          )}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={season.game?.title || season.name}
              fill
              sizes="144px"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/temporadas/${season.id}`}
                  className={cn(
                    "truncate font-semibold tracking-tight transition-colors hover:text-primary",
                    featured ? "text-2xl" : "text-lg",
                  )}
                >
                  {season.name}
                </Link>
                {season.is_active ? (
                  <Badge className="border-green-500/40 bg-green-500/15 text-green-400 hover:bg-green-500/15">
                    Ativa
                  </Badge>
                ) : (
                  <Badge variant="outline">Finalizada</Badge>
                )}
              </div>

              <p className="truncate text-sm text-muted-foreground">
                {season.game?.title}
              </p>

              <p className="text-xs text-muted-foreground">
                {season.is_active ? "Iniciada" : "Encerrada"} em{" "}
                {formatSeasonDate(
                  season.is_active ? season.started_at : season.ended_at || season.started_at,
                )}
              </p>
            </div>

            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {season.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {season.description}
            </p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-border/40 bg-background/30 px-2.5 py-2 text-center sm:px-3">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <Calendar className="h-3 w-3" />
                Dias
              </div>
              <p className="mt-0.5 text-lg font-bold tabular-nums sm:text-xl">
                {daysActive}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/30 px-2.5 py-2 text-center sm:px-3">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <Users className="h-3 w-3" />
                Grupo
              </div>
              <p className="mt-0.5 text-lg font-bold tabular-nums sm:text-xl">
                {participantCount}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/30 px-2.5 py-2 text-center sm:px-3">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <Clock className="h-3 w-3" />
                Jogado
              </div>
              <p className="mt-0.5 text-lg font-bold tabular-nums sm:text-xl">
                {formatSeasonPlaytime(totalMinutes)}
              </p>
            </div>
          </div>

          {participants.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {visibleAvatars.map((participant) => (
                    <Avatar
                      key={participant.id}
                      className="h-7 w-7 border-2 border-background ring-1 ring-border/40"
                      title={participant.player?.name}
                    >
                      <AvatarImage
                        src={participant.player?.avatar_url || undefined}
                        alt={participant.player?.name}
                      />
                      <AvatarFallback className="text-[9px]">
                        {participant.player?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {participants.length > visibleAvatars.length && (
                  <span className="text-xs text-muted-foreground">
                    +{participants.length - visibleAvatars.length}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {participants.map((participant) => {
                  const status = participant.status;
                  const showStatus = status && status !== "Em andamento";

                  return (
                    <div
                      key={participant.id}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-2 py-1 text-xs"
                    >
                      <span className="truncate font-medium">
                        {participant.player?.name}
                      </span>
                      {showStatus && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 shrink-0 px-1.5 text-[10px]",
                            SEASON_PARTICIPANT_STATUS_STYLES[status],
                          )}
                        >
                          {status}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border/60 bg-background/40"
            >
              <Link href={`/dashboard/temporadas/${season.id}`}>
                <Trophy className="h-3.5 w-3.5" />
                Ver detalhes
              </Link>
            </Button>

            {season.is_active && onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border/60 bg-background/40"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}

            {season.is_active && onFinish && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border/60 bg-background/40"
                onClick={onFinish}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>
    </article>
  );
}
