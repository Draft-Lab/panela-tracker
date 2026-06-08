"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Game } from "@/lib/types";
import type { RoulettePoolEntry } from "@/lib/roulette/types";
import { pickRouletteWinner } from "@/lib/roulette/pick-winner";

const MIN_TICKS = 25;
const MAX_TICKS = 40;
const BASE_DELAY_MS = 100;
const DELAY_INCREMENT_MS = 8;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface UseRouletteSpinOptions {
  onTick: (game: Game) => void;
  onComplete: (winner: Game) => void;
}

export function useRouletteSpin({ onTick, onComplete }: UseRouletteSpinOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const cancelSpin = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    runningRef.current = false;
  }, []);

  useEffect(() => cancelSpin, [cancelSpin]);

  const spin = useCallback(
    (entries: RoulettePoolEntry[]) => {
      cancelSpin();

      const winnerEntry = pickRouletteWinner(entries);
      if (!winnerEntry) return;

      const games = entries.map((entry) => entry.game);

      if (prefersReducedMotion()) {
        onTick(winnerEntry.game);
        onComplete(winnerEntry.game);
        return;
      }

      runningRef.current = true;
      const totalTicks = MIN_TICKS + Math.floor(Math.random() * (MAX_TICKS - MIN_TICKS + 1));
      let tick = 0;

      const scheduleTick = () => {
        if (!runningRef.current) return;

        const isLastTick = tick >= totalTicks - 1;
        const game = isLastTick
          ? winnerEntry.game
          : games[Math.floor(Math.random() * games.length)];

        onTick(game);

        if (isLastTick) {
          runningRef.current = false;
          onComplete(winnerEntry.game);
          return;
        }

        tick += 1;
        timeoutRef.current = setTimeout(
          scheduleTick,
          BASE_DELAY_MS + tick * DELAY_INCREMENT_MS,
        );
      };

      scheduleTick();
    },
    [cancelSpin, onComplete, onTick],
  );

  return { spin, cancelSpin, isSpinning: () => runningRef.current };
}
