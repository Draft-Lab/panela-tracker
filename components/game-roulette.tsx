"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Game, JogatinaPlayer } from "@/lib/types";
import {
  buildGameSessionStatsMap,
  type JogatinaWithPlayers,
} from "@/lib/roulette/game-session-stats";
import {
  buildEligiblePool,
  buildRoulettePool,
} from "@/lib/roulette/build-pool";
import { extractLibraryGenres } from "@/lib/roulette/extract-genres";
import {
  DEFAULT_ROULETTE_FILTERS,
  type RouletteSmartFilters,
} from "@/lib/roulette/types";
import { RouletteGamePool } from "@/components/roulette/roulette-game-pool";
import { RouletteSmartFiltersPanel } from "@/components/roulette/roulette-smart-filters";
import {
  RouletteStage,
  type RouletteStageState,
} from "@/components/roulette/roulette-stage";
import { useRouletteSpin } from "@/components/roulette/use-roulette-spin";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { toast } from "sonner";

interface GameRouletteProps {
  games: Game[];
  jogatinas: JogatinaWithPlayers[];
  jogatinaPlayers: Pick<JogatinaPlayer, "jogatina_id" | "player_id">[];
}

export function GameRoulette({
  games,
  jogatinas,
  jogatinaPlayers,
}: GameRouletteProps) {
  const [filters, setFilters] = useState<RouletteSmartFilters>(
    DEFAULT_ROULETTE_FILTERS,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [stageState, setStageState] = useState<RouletteStageState>("idle");
  const [displayedGame, setDisplayedGame] = useState<Game | null>(null);
  const [winner, setWinner] = useState<Game | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set(games.map((game) => game.id)));
  }, [games]);

  const statsMap = useMemo(
    () => buildGameSessionStatsMap(jogatinas, jogatinaPlayers),
    [jogatinas, jogatinaPlayers],
  );

  const genres = useMemo(() => extractLibraryGenres(games), [games]);

  const eligiblePool = useMemo(
    () => buildEligiblePool(games, statsMap, filters),
    [games, statsMap, filters],
  );

  const spinPool = useMemo(
    () => buildRoulettePool(games, statsMap, filters, selectedIds),
    [games, statsMap, filters, selectedIds],
  );

  const handleSpinComplete = useCallback((picked: Game) => {
    setWinner(picked);
    setDisplayedGame(picked);
    setStageState("winner");
    setSpinning(false);
    toast.success(`Sorteado: ${picked.title}`);
  }, []);

  const handleSpinTick = useCallback((game: Game) => {
    setDisplayedGame(game);
  }, []);

  const { spin, cancelSpin } = useRouletteSpin({
    onTick: handleSpinTick,
    onComplete: handleSpinComplete,
  });

  useEffect(() => cancelSpin, [cancelSpin]);

  const toggleGame = (gameId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  const selectVisible = (gameIds: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      gameIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearVisible = (gameIds: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      gameIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleSpin = () => {
    if (spinPool.entries.length === 0) return;

    setWinner(null);
    setStageState("spinning");
    setSpinning(true);
    spin(spinPool.entries);
  };

  const handleSpinAgain = () => {
    setWinner(null);
    setDisplayedGame(null);
    setStageState("idle");
    handleSpin();
  };

  const poolSize = spinPool.entries.length;
  const isSpinDisabled = poolSize === 0;

  const filtersFooterMessage =
    poolSize === 0 && eligiblePool.entries.length > 0
      ? "Nenhum jogo no pool — selecione jogos ou afrouxe os filtros."
      : poolSize === 0 && eligiblePool.entries.length === 0
        ? "Nenhum jogo no pool — afrouxe os filtros."
        : null;

  return (
    <div className="flex min-w-0 flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Roleta de jogos"
        description="Filtros inteligentes e sorteio justo para o próximo jogo do grupo."
      />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
        <RouletteStage
          state={spinning ? "spinning" : stageState}
          displayedGame={displayedGame}
          winner={winner}
          poolSize={poolSize}
          isSpinDisabled={isSpinDisabled}
          onSpin={handleSpin}
          onSpinAgain={handleSpinAgain}
        />

        <RouletteSmartFiltersPanel
          filters={filters}
          genres={genres}
          poolSize={poolSize}
          onChange={setFilters}
          footerMessage={filtersFooterMessage}
        />
      </div>

      <RouletteGamePool
        entries={eligiblePool.entries}
        selectedIds={selectedIds}
        onToggle={toggleGame}
        onSelectAll={selectVisible}
        onClearVisible={clearVisible}
      />
    </div>
  );
}
