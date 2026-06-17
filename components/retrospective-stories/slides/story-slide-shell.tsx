"use client";

import type { ReactNode } from "react";
import type { PlayerStorySlide } from "../build-player-slides";
import { STORY_THEMES } from "../story-themes";
import { cn } from "@/lib/utils";

const BACKGROUND_LAYERS = [
  {
    position: "inset-0 h-full w-full object-cover scale-105",
    blur: "blur-md",
    opacity: "opacity-50",
  },
  {
    position: "top-[-8%] right-[-12%] h-[55%] w-[55%] object-cover rotate-3",
    blur: "blur-lg",
    opacity: "opacity-30",
  },
  {
    position: "bottom-[-8%] left-[-12%] h-[50%] w-[50%] object-cover -rotate-3",
    blur: "blur-lg",
    opacity: "opacity-25",
  },
] as const;

interface StorySlideShellProps {
  slide: PlayerStorySlide;
  children: ReactNode;
  contentClassName?: string;
  shellClassName?: string;
}

export function StorySlideShell({
  slide,
  children,
  contentClassName,
  shellClassName,
}: StorySlideShellProps) {
  const theme = STORY_THEMES[slide.theme];
  const backgroundCovers = slide.backgroundCovers ?? [];

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8 py-16",
        theme.shell,
        shellClassName,
      )}
    >
      {backgroundCovers.length > 0 && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {backgroundCovers.map((url, index) => {
            const layer = BACKGROUND_LAYERS[index] ?? BACKGROUND_LAYERS[0];
            return (
              <img
                key={`${url}-${index}`}
                src={url}
                alt=""
                aria-hidden
                className={cn(
                  "absolute saturate-125",
                  layer.position,
                  layer.blur,
                  layer.opacity,
                )}
              />
            );
          })}
          <div className="absolute inset-0 bg-background/58" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/65 via-background/35 to-background/80" />
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-b opacity-35",
          theme.glow,
        )}
      />

      <div
        className={cn(
          "relative z-10 flex max-h-full w-full max-w-sm flex-col items-center overflow-hidden py-2 text-center",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
