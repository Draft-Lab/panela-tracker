"use client";

import type { PlayerRankedSquadMate } from "@/lib/player-retrospective-helpers";
import type { SquadMatesSlide } from "../build-player-slides";
import { STORY_THEMES } from "../story-themes";
import { StorySlideShell } from "./story-slide-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SquadMatesStorySlideProps {
  slide: SquadMatesSlide;
}

function SquadMateRow({ entry }: { entry: PlayerRankedSquadMate }) {
  const theme = STORY_THEMES.highlight;

  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", theme.card)}>
      <span className="w-4 shrink-0 text-[10px] font-bold text-primary">
        {entry.rank}
      </span>
      <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
        <AvatarImage src={entry.player.avatar_url ?? undefined} alt={entry.player.name} />
        <AvatarFallback className="text-[10px]">
          {entry.player.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold">{entry.player.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {entry.sharedSessions}{" "}
          {entry.sharedSessions === 1 ? "sessão" : "sessões"} · {entry.percent}%
        </p>
      </div>
    </div>
  );
}

export function SquadMatesStorySlide({ slide }: SquadMatesStorySlideProps) {
  const theme = STORY_THEMES[slide.theme];
  const [topMate, ...runnersUp] = slide.rankedSquadMates;

  if (!topMate) return null;

  return (
    <StorySlideShell
      slide={slide}
      shellClassName="px-6 py-14"
      contentClassName="justify-center gap-2.5 overflow-hidden"
    >
      <p className={cn("text-xs font-semibold uppercase tracking-widest", theme.muted)}>
        Com quem mais jogou
      </p>

      <Avatar className="h-24 w-24 border-4 border-primary/30 ring-2 ring-primary/20">
        <AvatarImage
          src={topMate.player.avatar_url ?? undefined}
          alt={topMate.player.name}
        />
        <AvatarFallback className="bg-muted text-2xl">
          {topMate.player.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <h2 className="max-w-[260px] text-lg font-black leading-snug line-clamp-2">
        {topMate.player.name}
      </h2>

      <p className={cn("text-4xl font-black tabular-nums leading-none", theme.accent)}>
        {topMate.sharedSessions}
      </p>
      <p className={cn("text-xs", theme.muted)}>
        {topMate.sharedSessions === 1 ? "sessão juntos" : "sessões juntos"} ·{" "}
        {topMate.percent}% das suas em grupo
      </p>

      {runnersUp.length > 0 && (
        <div className="mt-1 w-full max-w-[280px] space-y-1.5 border-t border-border/40 pt-3">
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest", theme.muted)}>
            Também no squad
          </p>
          {runnersUp.map((entry) => (
            <SquadMateRow key={entry.player.id} entry={entry} />
          ))}
        </div>
      )}
    </StorySlideShell>
  );
}
