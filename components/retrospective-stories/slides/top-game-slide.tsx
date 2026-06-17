"use client";

import { formatDuration } from "@/lib/calendar-helpers";
import type { PlayerRankedGame } from "@/lib/player-retrospective-helpers";
import type { TopGameSlide } from "../build-player-slides";
import { STORY_THEMES } from "../story-themes";
import { StorySlideShell } from "./story-slide-shell";
import { cn } from "@/lib/utils";

interface TopGameStorySlideProps {
  slide: TopGameSlide;
}

function RunnerRow({ entry }: { entry: PlayerRankedGame }) {
  const theme = STORY_THEMES.cover;

  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", theme.card)}>
      <span className="w-4 shrink-0 text-[10px] font-bold text-primary">
        {entry.rank}
      </span>
      <div className="h-9 w-7 shrink-0 overflow-hidden rounded bg-muted">
        {entry.game.cover_url ? (
          <img
            src={entry.game.cover_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[8px] text-muted-foreground">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold">{entry.game.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {entry.percent}% · {formatDuration(entry.minutes)}
        </p>
      </div>
    </div>
  );
}

export function TopGameStorySlide({ slide }: TopGameStorySlideProps) {
  const theme = STORY_THEMES[slide.theme];
  const [topGame, ...runnersUp] = slide.rankedGames;

  if (!topGame) return null;

  return (
    <StorySlideShell
      slide={slide}
      shellClassName="px-6 py-14"
      contentClassName="justify-center gap-2.5 overflow-hidden"
    >
      <p className={cn("text-xs font-semibold uppercase tracking-widest", theme.muted)}>
        Seu jogo do ano
      </p>

      {topGame.game.cover_url ? (
        <img
          src={topGame.game.cover_url}
          alt={topGame.game.title}
          className="w-28 rounded-lg shadow-lg ring-1 ring-primary/30"
        />
      ) : (
        <div className="flex h-36 w-24 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
          Sem capa
        </div>
      )}

      <h2 className="max-w-[260px] text-lg font-black leading-snug line-clamp-2">
        {topGame.game.title}
      </h2>

      <p className={cn("text-4xl font-black tabular-nums leading-none", theme.accent)}>
        {topGame.percent}%
      </p>
      <p className={cn("text-xs", theme.muted)}>
        {formatDuration(topGame.minutes)} · do seu tempo no ano
      </p>

      {runnersUp.length > 0 && (
        <div className="mt-1 w-full max-w-[280px] space-y-1.5 border-t border-border/40 pt-3">
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest", theme.muted)}>
            Também no pódio
          </p>
          {runnersUp.map((entry) => (
            <RunnerRow key={entry.game.id} entry={entry} />
          ))}
        </div>
      )}
    </StorySlideShell>
  );
}
