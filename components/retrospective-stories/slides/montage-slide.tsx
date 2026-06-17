"use client";

import { formatDuration } from "@/lib/calendar-helpers";
import type { MontageSlide } from "../build-player-slides";
import { STORY_THEMES } from "../story-themes";
import { StorySlideShell } from "./story-slide-shell";
import { cn } from "@/lib/utils";

interface MontageStorySlideProps {
  slide: MontageSlide;
}

function MonthGameRow({
  entry,
  monthLabel,
}: {
  entry: MontageSlide["covers"][number];
  monthLabel: string;
}) {
  const theme = STORY_THEMES.emphasis;

  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", theme.card)}>
      <span className="w-7 shrink-0 text-[10px] font-bold uppercase text-primary">
        {monthLabel}
      </span>
      <div className="h-9 w-7 shrink-0 overflow-hidden rounded bg-muted">
        {entry.coverUrl ? (
          <img src={entry.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[8px] text-muted-foreground">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold">{entry.gameTitle}</p>
        <p className="text-[10px] text-muted-foreground">
          {entry.sessionCount}{" "}
          {entry.sessionCount === 1 ? "sessão" : "sessões"} ·{" "}
          {formatDuration(entry.totalMinutes)}
        </p>
      </div>
    </div>
  );
}

export function MontageStorySlide({ slide }: MontageStorySlideProps) {
  const theme = STORY_THEMES[slide.theme];

  const featuredIndex = slide.covers.reduce(
    (bestIndex, entry, index, entries) =>
      entry.totalMinutes > entries[bestIndex].totalMinutes ? index : bestIndex,
    0,
  );
  const featuredMonth = slide.covers[featuredIndex];
  const otherMonths = slide.covers.filter((_, index) => index !== featuredIndex);
  const visibleMonths = otherMonths.slice(0, 3);
  const hiddenMonthCount = otherMonths.length - visibleMonths.length;

  if (!featuredMonth) return null;

  const featuredLabel = featuredMonth.monthName.slice(0, 3);

  return (
    <StorySlideShell
      slide={slide}
      shellClassName="px-6 py-14"
      contentClassName="justify-center gap-2.5 overflow-hidden"
    >
      <p className={cn("text-xs font-semibold uppercase tracking-widest", theme.muted)}>
        Seu ano em capas
      </p>

      {featuredMonth.coverUrl ? (
        <img
          src={featuredMonth.coverUrl}
          alt={featuredMonth.gameTitle}
          className="w-28 rounded-lg shadow-lg ring-1 ring-primary/30"
        />
      ) : (
        <div className="flex h-36 w-24 items-center justify-center rounded-lg bg-muted px-2 text-center text-[10px] text-muted-foreground">
          {featuredMonth.gameTitle}
        </div>
      )}

      <p className={cn("text-[10px] font-semibold uppercase tracking-widest", theme.muted)}>
        {featuredMonth.monthName}
      </p>

      <h2 className="max-w-[260px] text-lg font-black leading-snug line-clamp-2">
        {featuredMonth.gameTitle}
      </h2>

      <p className={cn("text-4xl font-black tabular-nums leading-none", theme.accent)}>
        {featuredMonth.sessionCount}
      </p>
      <p className={cn("text-xs", theme.muted)}>
        {featuredMonth.sessionCount === 1 ? "sessão" : "sessões"} ·{" "}
        {formatDuration(featuredMonth.totalMinutes)} em {featuredLabel.toLowerCase()}
      </p>

      {visibleMonths.length > 0 && (
        <div className="mt-1 w-full max-w-[280px] space-y-1.5 border-t border-border/40 pt-3">
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest", theme.muted)}>
            Outros meses
          </p>
          {visibleMonths.map((entry) => (
            <MonthGameRow
              key={entry.monthName}
              entry={entry}
              monthLabel={entry.monthName.slice(0, 3)}
            />
          ))}
          {hiddenMonthCount > 0 && (
            <p className={cn("pt-0.5 text-[10px]", theme.muted)}>
              +{hiddenMonthCount}{" "}
              {hiddenMonthCount === 1 ? "mês" : "meses"} no ano
            </p>
          )}
        </div>
      )}
    </StorySlideShell>
  );
}
