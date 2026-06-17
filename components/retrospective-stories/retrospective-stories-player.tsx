"use client";

import { useEffect, useMemo } from "react";
import type { PlayerYearRetrospective } from "@/lib/player-retrospective-helpers";
import { buildPlayerSlides } from "./build-player-slides";
import { useRetrospectiveStories } from "./use-retrospective-stories";
import { RetrospectiveStoriesProgress } from "./retrospective-stories-progress";
import { StorySlideContent } from "./slides/story-slide-content";

interface RetrospectiveStoriesPlayerProps {
  retrospective: PlayerYearRetrospective;
}

export function RetrospectiveStoriesPlayer({
  retrospective,
}: RetrospectiveStoriesPlayerProps) {
  const profileHref = `/jogadores/${retrospective.player.id}`;

  const slides = useMemo(
    () => buildPlayerSlides(retrospective, profileHref),
    [retrospective, profileHref],
  );

  const {
    currentIndex,
    isPaused,
    prefersReducedMotion,
    goNext,
    goPrev,
    pause,
    resume,
  } = useRetrospectiveStories({ slideCount: slides.length });

  const currentSlide = slides[currentIndex];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  if (!currentSlide) return null;

  return (
    <div className="relative h-dvh w-full select-none">
      <RetrospectiveStoriesProgress
        total={slides.length}
        currentIndex={currentIndex}
        isPaused={isPaused}
        prefersReducedMotion={prefersReducedMotion}
      />

      <div className="h-full w-full animate-in fade-in duration-300">
        <StorySlideContent key={currentSlide.id} slide={currentSlide} />
      </div>

      <button
        type="button"
        className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
        aria-label="Slide anterior"
        onClick={goPrev}
        onPointerDown={prefersReducedMotion ? undefined : pause}
        onPointerUp={prefersReducedMotion ? undefined : resume}
        onPointerLeave={prefersReducedMotion ? undefined : resume}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-pointer"
        aria-label="Próximo slide"
        onClick={goNext}
        onPointerDown={prefersReducedMotion ? undefined : pause}
        onPointerUp={prefersReducedMotion ? undefined : resume}
        onPointerLeave={prefersReducedMotion ? undefined : resume}
      />
    </div>
  );
}
