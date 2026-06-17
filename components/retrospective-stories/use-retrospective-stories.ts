"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORY_SLIDE_DURATION_MS } from "./story-constants";

interface UseRetrospectiveStoriesOptions {
  slideCount: number;
  onComplete?: () => void;
}

export function useRetrospectiveStories({
  slideCount,
  onComplete,
}: UseRetrospectiveStoriesOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const remainingMsRef = useRef(STORY_SLIDE_DURATION_MS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideStartedAtRef = useRef(performance.now());

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) return;
      const next = Math.max(0, Math.min(index, slideCount - 1));
      clearTimer();
      setCurrentIndex(next);
      remainingMsRef.current = STORY_SLIDE_DURATION_MS;
      slideStartedAtRef.current = performance.now();
    },
    [clearTimer, slideCount],
  );

  const goNext = useCallback(() => {
    if (currentIndex >= slideCount - 1) {
      onComplete?.();
      return;
    }
    goTo(currentIndex + 1);
  }, [currentIndex, goTo, onComplete, slideCount]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  useEffect(() => {
    setCurrentIndex(0);
    remainingMsRef.current = STORY_SLIDE_DURATION_MS;
    slideStartedAtRef.current = performance.now();
  }, [slideCount]);

  useEffect(() => {
    clearTimer();

    if (slideCount === 0 || isPaused || prefersReducedMotion) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      goNext();
    }, remainingMsRef.current);

    return clearTimer;
  }, [
    clearTimer,
    currentIndex,
    goNext,
    isPaused,
    prefersReducedMotion,
    slideCount,
  ]);

  const pause = useCallback(() => {
    if (isPaused) return;
    const elapsed = performance.now() - slideStartedAtRef.current;
    remainingMsRef.current = Math.max(0, STORY_SLIDE_DURATION_MS - elapsed);
    clearTimer();
    setIsPaused(true);
  }, [clearTimer, isPaused]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    slideStartedAtRef.current =
      performance.now() - (STORY_SLIDE_DURATION_MS - remainingMsRef.current);
    setIsPaused(false);
  }, [isPaused]);

  return {
    currentIndex,
    isPaused,
    prefersReducedMotion,
    goNext,
    goPrev,
    goTo,
    pause,
    resume,
  };
}
