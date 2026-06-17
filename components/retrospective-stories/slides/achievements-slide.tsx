"use client";

import type { PlayerAchievement } from "@/lib/player-achievements";
import type { AchievementsSlide } from "../build-player-slides";
import { STORY_THEMES } from "../story-themes";
import { StorySlideShell } from "./story-slide-shell";
import { cn } from "@/lib/utils";

interface AchievementsStorySlideProps {
  slide: AchievementsSlide;
}

function AchievementBadge({
  achievement,
  className,
}: {
  achievement: PlayerAchievement;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border font-black shadow-sm",
        achievement.style,
        className,
      )}
    >
      {achievement.label.charAt(0)}
    </div>
  );
}

function AchievementRow({ entry, rank }: { entry: PlayerAchievement; rank: number }) {
  const theme = STORY_THEMES.cover;

  return (
    <div className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", theme.card)}>
      <span className="w-4 shrink-0 text-[10px] font-bold text-primary">{rank}</span>
      <AchievementBadge achievement={entry} className="h-9 w-9 shrink-0 text-xs" />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold">{entry.label}</p>
        <p className="line-clamp-1 text-[10px] text-muted-foreground">
          {entry.description}
        </p>
      </div>
    </div>
  );
}

export function AchievementsStorySlide({ slide }: AchievementsStorySlideProps) {
  const theme = STORY_THEMES[slide.theme];
  const [topAchievement, ...runnersUp] = slide.achievements;

  if (!topAchievement) return null;

  return (
    <StorySlideShell
      slide={slide}
      shellClassName="px-6 py-14"
      contentClassName="justify-center gap-2.5 overflow-hidden"
    >
      <p className={cn("text-xs font-semibold uppercase tracking-widest", theme.muted)}>
        Conquistas do ano
      </p>

      <AchievementBadge
        achievement={topAchievement}
        className="h-28 w-28 text-4xl ring-1 ring-primary/30"
      />

      <h2 className="max-w-[260px] text-lg font-black leading-snug line-clamp-2">
        {topAchievement.label}
      </h2>

      <p className={cn("text-4xl font-black tabular-nums leading-none", theme.accent)}>
        {slide.achievements.length}
      </p>
      <p className={cn("text-xs", theme.muted)}>
        {slide.achievements.length === 1 ? "badge desbloqueado" : "badges desbloqueados"}
      </p>
      <p className={cn("max-w-[260px] text-[11px] leading-relaxed", theme.muted)}>
        {topAchievement.description}
      </p>

      {runnersUp.length > 0 && (
        <div className="mt-1 w-full max-w-[280px] space-y-1.5 border-t border-border/40 pt-3">
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest", theme.muted)}>
            Também desbloqueou
          </p>
          {runnersUp.map((achievement, index) => (
            <AchievementRow
              key={achievement.id}
              entry={achievement}
              rank={index + 2}
            />
          ))}
        </div>
      )}
    </StorySlideShell>
  );
}
