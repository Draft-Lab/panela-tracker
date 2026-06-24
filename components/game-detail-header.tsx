"use client";

import type { Game } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Monitor, Star } from "lucide-react";
import { AddJogatinaDialog } from "@/components/add-jogatina-dialog";
import { glassInnerFlush, glassOuter } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface GameDetailHeaderProps {
  game: Game;
}

export function GameDetailHeader({ game }: GameDetailHeaderProps) {
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date).toLocaleDateString("pt-BR")
    : null;

  return (
    <section className="mb-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6 text-muted-foreground">
        <Link href="/dashboard/jogos">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Jogos
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <div className="relative mx-auto w-full max-w-[220px] lg:mx-0">
          <div className={cn(glassOuter, "p-1 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.8)]")}>
            <div className={cn(glassInnerFlush, "aspect-[3/4] bg-muted")}>
            {game.cover_url ? (
              <img
                src={game.cover_url}
                alt={game.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <span className="text-5xl font-bold opacity-20">
                  {game.title.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {game.is_app && (
                <Badge variant="secondary" className="gap-1">
                  <Monitor className="h-3 w-3" />
                  App
                </Badge>
              )}
              {game.rating != null && (
                <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  {Math.round(game.rating)}/100
                </Badge>
              )}
              {releaseDate && (
                <Badge variant="outline" className="text-muted-foreground">
                  Lançamento {releaseDate}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {game.title}
            </h1>

            <p className="text-sm text-muted-foreground">
              Cadastrado em {new Date(game.created_at).toLocaleDateString("pt-BR")}
              {game.igdb_synced_at &&
                ` · IGDB em ${new Date(game.igdb_synced_at).toLocaleDateString("pt-BR")}`}
            </p>
          </div>

          <div>
            <AddJogatinaDialog
              gameId={game.id}
              trigger={
                <Button className="active:scale-[0.98]">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Nova Jogatina
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
