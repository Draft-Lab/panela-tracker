"use client";

import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline";
import { cn } from "@/lib/utils";
import { Dices, ExternalLink, Gamepad2 } from "lucide-react";

export type RouletteStageState = "idle" | "spinning" | "winner";

interface RouletteStageProps {
  state: RouletteStageState;
  displayedGame: Game | null;
  winner: Game | null;
  poolSize: number;
  isSpinDisabled: boolean;
  onSpin: () => void;
  onSpinAgain: () => void;
  className?: string;
}

function StageCover({ game, highlighted }: { game: Game; highlighted?: boolean }) {
  const coverUrl = game.cover_url;

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-xl bg-muted shadow-lg ring-1",
        highlighted
          ? "ring-primary/60 shadow-primary/20"
          : "ring-border/60",
      )}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={game.title}
          fill
          sizes="220px"
          className="object-cover object-center"
          priority={highlighted}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Gamepad2 className="h-12 w-12 text-muted-foreground" strokeWidth={1.75} />
        </div>
      )}
    </div>
  );
}

export function RouletteStage({
  state,
  displayedGame,
  winner,
  poolSize,
  isSpinDisabled,
  onSpin,
  onSpinAgain,
  className,
}: RouletteStageProps) {
  const activeGame = state === "winner" ? winner : displayedGame;
  const coverUrl = activeGame?.cover_url;

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-xl border border-border/50",
        className,
      )}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center blur-xl brightness-[0.45] saturate-125"
            />
            <div className="absolute inset-0 bg-background/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-background/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-card/30 to-background" />
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 p-6 sm:p-8">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 w-full">
        {state === "idle" && (
          <div className="text-center space-y-3">
            <Dices className="mx-auto h-14 w-14 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground max-w-xs">
              {poolSize > 0
                ? `${poolSize} jogos prontos para o sorteio`
                : "Nenhum jogo no pool. Afrouxe os filtros."}
            </p>
          </div>
        )}

        {(state === "spinning" || state === "winner") && activeGame && (
          <div
            className={cn(
              "flex w-full max-w-sm flex-col items-center gap-4 text-center",
              state === "spinning" && "animate-pulse",
              state === "winner" && "animate-in zoom-in-95 duration-500",
            )}
          >
            {state === "winner" && (
              <Badge className="bg-primary/15 text-primary border-primary/30">
                Sorteado
              </Badge>
            )}
            <StageCover game={activeGame} highlighted={state === "winner"} />
            <div className="min-w-0 space-y-1.5">
              <h3 className="text-xl font-semibold tracking-tight line-clamp-2">
                {activeGame.title}
              </h3>
              <GameIgdbMetaInline game={activeGame} variant="line" />
            </div>
          </div>
        )}
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            size="lg"
            onClick={onSpin}
            disabled={isSpinDisabled || state === "spinning"}
            className="active:scale-[0.98]"
          >
            <Dices className="h-5 w-5 mr-2" />
            {state === "spinning" ? "Girando..." : "Girar roleta"}
          </Button>

          {state === "winner" && winner && (
            <>
              <Button
                variant="outline"
                onClick={onSpinAgain}
                className="active:scale-[0.98]"
              >
                Sortear de novo
              </Button>
              <Button variant="secondary" asChild className="active:scale-[0.98]">
                <Link href={`/dashboard/jogos/${winner.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver jogo
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
