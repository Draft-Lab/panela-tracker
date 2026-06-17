"use client";

import { STORY_SLIDE_DURATION_MS } from "./story-constants";

interface RetrospectiveStoriesProgressProps {
  total: number;
  currentIndex: number;
  isPaused: boolean;
  prefersReducedMotion: boolean;
}

export function RetrospectiveStoriesProgress({
  total,
  currentIndex,
  isPaused,
  prefersReducedMotion,
}: RetrospectiveStoriesProgressProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
      {Array.from({ length: total }).map((_, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={index}
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-border/60"
          >
            {isPast ? (
              <div className="h-full w-full bg-primary" />
            ) : isCurrent ? (
              prefersReducedMotion ? (
                <div className="h-full w-full bg-primary/70" />
              ) : (
                <div
                  key={currentIndex}
                  className="story-progress-fill h-full w-full bg-primary"
                  style={{
                    ["--story-duration" as string]: `${STORY_SLIDE_DURATION_MS}ms`,
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
