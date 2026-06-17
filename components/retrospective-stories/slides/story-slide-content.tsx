"use client";

import type { PlayerStorySlide } from "../build-player-slides";
import { STORY_THEMES } from "../story-themes";
import { AchievementsStorySlide } from "./achievements-slide";
import { MontageStorySlide } from "./montage-slide";
import { SquadMatesStorySlide } from "./squad-mates-slide";
import { TopGameStorySlide } from "./top-game-slide";
import { StorySlideShell } from "./story-slide-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StorySlideContentProps {
  slide: PlayerStorySlide;
}

export function StorySlideContent({ slide }: StorySlideContentProps) {
  const theme = STORY_THEMES[slide.theme];

  switch (slide.type) {
    case "intro":
      return (
        <StorySlideShell slide={slide}>
          <Avatar className="mb-6 h-24 w-24 border-4 border-primary/30 ring-2 ring-primary/20">
            <AvatarImage src={slide.avatarUrl ?? undefined} alt={slide.playerName} />
            <AvatarFallback className="bg-muted text-2xl">
              {slide.playerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className={cn("text-sm font-semibold uppercase tracking-[0.2em]", theme.muted)}>
            Sua retrospectiva
          </p>
          <h1 className={cn("mt-2 text-5xl font-black leading-none tracking-tight", theme.accent)}>
            {slide.year}
          </h1>
          <p className="mt-4 text-lg font-medium">{slide.playerName}</p>
        </StorySlideShell>
      );

    case "time":
      return (
        <StorySlideShell slide={slide}>
          <p className={cn("text-lg font-medium", theme.muted)}>
            Em {slide.year}, você jogou
          </p>
          <p className={cn("mt-4 text-6xl font-black leading-none tracking-tighter", theme.accent)}>
            {slide.hoursLabel}
          </p>
          <p className={cn("mt-6 text-base", theme.muted)}>
            Tudo isso somando suas sessões no grupo.
          </p>
        </StorySlideShell>
      );

    case "sessions":
      return (
        <StorySlideShell slide={slide}>
          <p className={cn("text-lg font-medium", theme.muted)}>Foram</p>
          <p className={cn("mt-2 text-8xl font-black tabular-nums leading-none", theme.accent)}>
            {slide.totalSessions}
          </p>
          <p className="mt-4 text-2xl font-bold">
            {slide.totalSessions === 1 ? "sessão" : "sessões"}
          </p>
          <p className={cn("mt-4 text-sm", theme.muted)}>registradas no ano</p>
        </StorySlideShell>
      );

    case "squad-mates":
      return <SquadMatesStorySlide slide={slide} />;

    case "top-game":
      return <TopGameStorySlide slide={slide} />;

    case "variety":
      return (
        <StorySlideShell slide={slide}>
          <p className={cn("text-lg font-medium", theme.muted)}>Você explorou</p>
          <p className={cn("mt-2 text-8xl font-black tabular-nums leading-none", theme.accent)}>
            {slide.uniqueGames}
          </p>
          <p className="mt-4 text-2xl font-bold">
            {slide.uniqueGames === 1 ? "jogo diferente" : "jogos diferentes"}
          </p>
        </StorySlideShell>
      );

    case "busiest-month":
      return (
        <StorySlideShell slide={slide}>
          <p className={cn("text-sm font-semibold uppercase tracking-widest", theme.muted)}>
            Mês mais ativo
          </p>
          <p className={cn("mt-6 text-5xl font-black", theme.accent)}>
            {slide.monthName}
          </p>
          <p className={cn("mt-6 text-lg", theme.muted)}>com</p>
          <p className="mt-2 text-7xl font-black tabular-nums">
            {slide.sessionCount}
          </p>
          <p className="mt-2 text-xl font-semibold">
            {slide.sessionCount === 1 ? "sessão" : "sessões"}
          </p>
        </StorySlideShell>
      );

    case "achievements":
      return <AchievementsStorySlide slide={slide} />;

    case "montage":
      return <MontageStorySlide slide={slide} />;

    case "outro":
      return (
        <StorySlideShell slide={slide}>
          <p className={cn("text-lg font-medium", theme.muted)}>
            Até {slide.year + 1},
          </p>
          <p className={cn("mt-2 text-4xl font-black", theme.accent)}>
            {slide.playerName}
          </p>
          <p className={cn("mt-6 text-base", theme.muted)}>
            Obrigado por jogar com a Panela.
          </p>
        </StorySlideShell>
      );

    case "empty":
      return (
        <StorySlideShell slide={slide}>
          <p className={cn("text-5xl font-black", theme.accent)}>{slide.year}</p>
          <p className={cn("mt-6 text-lg", theme.muted)}>
            Ainda não há sessões registradas neste ano.
          </p>
        </StorySlideShell>
      );
  }
}
