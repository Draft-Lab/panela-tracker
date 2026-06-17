import type { PlayerAchievement } from "@/lib/player-achievements";
import type {
  PlayerRankedGame,
  PlayerRankedSquadMate,
  PlayerYearRetrospective,
} from "@/lib/player-retrospective-helpers";
import { resolveStoryBackgroundCovers } from "./story-background-covers";

export type PlayerStorySlideType =
  | "intro"
  | "time"
  | "sessions"
  | "squad-mates"
  | "top-game"
  | "variety"
  | "busiest-month"
  | "achievements"
  | "montage"
  | "outro"
  | "empty";

export interface PlayerStorySlideBase {
  id: string;
  type: PlayerStorySlideType;
  theme: "default" | "emphasis" | "highlight" | "cover";
  backgroundCovers?: string[];
}

export interface IntroSlide extends PlayerStorySlideBase {
  type: "intro";
  playerName: string;
  avatarUrl: string | null;
  year: number;
}

export interface TimeSlide extends PlayerStorySlideBase {
  type: "time";
  hoursLabel: string;
  year: number;
}

export interface SessionsSlide extends PlayerStorySlideBase {
  type: "sessions";
  totalSessions: number;
}

export interface SquadMatesSlide extends PlayerStorySlideBase {
  type: "squad-mates";
  rankedSquadMates: PlayerRankedSquadMate[];
  totalGroupSessions: number;
}

export interface TopGameSlide extends PlayerStorySlideBase {
  type: "top-game";
  year: number;
  rankedGames: PlayerRankedGame[];
}

export interface VarietySlide extends PlayerStorySlideBase {
  type: "variety";
  uniqueGames: number;
}

export interface BusiestMonthSlide extends PlayerStorySlideBase {
  type: "busiest-month";
  monthName: string;
  sessionCount: number;
}

export interface AchievementsSlide extends PlayerStorySlideBase {
  type: "achievements";
  achievements: PlayerAchievement[];
}

export interface MontageSlide extends PlayerStorySlideBase {
  type: "montage";
  covers: Array<{
    monthName: string;
    coverUrl: string | null;
    gameTitle: string;
    sessionCount: number;
    totalMinutes: number;
  }>;
}

export interface OutroSlide extends PlayerStorySlideBase {
  type: "outro";
  year: number;
  playerName: string;
  profileHref: string;
}

export interface EmptySlide extends PlayerStorySlideBase {
  type: "empty";
  year: number;
  profileHref: string;
}

export type PlayerStorySlide =
  | IntroSlide
  | TimeSlide
  | SessionsSlide
  | SquadMatesSlide
  | TopGameSlide
  | VarietySlide
  | BusiestMonthSlide
  | AchievementsSlide
  | MontageSlide
  | OutroSlide
  | EmptySlide;

export function buildPlayerSlides(
  retrospective: PlayerYearRetrospective,
  profileHref: string,
): PlayerStorySlide[] {
  const defaultCovers = () => resolveStoryBackgroundCovers(retrospective);

  if (retrospective.isEmpty) {
    return [
      {
        id: "empty",
        type: "empty",
        theme: "default",
        year: retrospective.year,
        profileHref,
      },
    ];
  }

  const slides: PlayerStorySlide[] = [
    {
      id: "intro",
      type: "intro",
      theme: "highlight",
      playerName: retrospective.player.name,
      avatarUrl: retrospective.player.avatar_url,
      year: retrospective.year,
      backgroundCovers: defaultCovers(),
    },
    {
      id: "time",
      type: "time",
      theme: "emphasis",
      hoursLabel: retrospective.totalHoursLabel,
      year: retrospective.year,
      backgroundCovers: defaultCovers(),
    },
    {
      id: "sessions",
      type: "sessions",
      theme: "default",
      totalSessions: retrospective.totalSessions,
      backgroundCovers: defaultCovers(),
    },
  ];

  if (retrospective.rankedSquadMates.length > 0) {
    slides.push({
      id: "squad-mates",
      type: "squad-mates",
      theme: "highlight",
      rankedSquadMates: retrospective.rankedSquadMates,
      totalGroupSessions: retrospective.totalGroupSessions,
      backgroundCovers: defaultCovers(),
    });
  }

  if (retrospective.rankedGames.length > 0) {
    const topCover = retrospective.rankedGames[0]?.game.cover_url;
    slides.push({
      id: "top-game",
      type: "top-game",
      theme: "cover",
      year: retrospective.year,
      rankedGames: retrospective.rankedGames,
      backgroundCovers: resolveStoryBackgroundCovers(retrospective, {
        primaryCover: topCover,
        extraCovers: retrospective.rankedGames
          .slice(1)
          .map((entry) => entry.game.cover_url),
      }),
    });
  }

  slides.push({
    id: "variety",
    type: "variety",
    theme: "emphasis",
    uniqueGames: retrospective.uniqueGames,
    backgroundCovers: defaultCovers(),
  });

  if (retrospective.busiestMonth) {
    const monthCover = retrospective.monthlyCovers.find(
      (cover) => cover.monthIndex === retrospective.busiestMonth!.monthIndex,
    )?.game.cover_url;

    slides.push({
      id: "busiest-month",
      type: "busiest-month",
      theme: "highlight",
      monthName: retrospective.busiestMonth.monthName,
      sessionCount: retrospective.busiestMonth.sessionCount,
      backgroundCovers: resolveStoryBackgroundCovers(retrospective, {
        primaryCover: monthCover,
      }),
    });
  }

  if (retrospective.achievements.length > 0) {
    slides.push({
      id: "achievements",
      type: "achievements",
      theme: "cover",
      achievements: retrospective.achievements.slice(0, 4),
      backgroundCovers: defaultCovers(),
    });
  }

  if (retrospective.monthlyCovers.length > 0) {
    const montageCovers = retrospective.monthlyCovers.map(
      (cover) => cover.game.cover_url,
    );
    slides.push({
      id: "montage",
      type: "montage",
      theme: "emphasis",
      covers: retrospective.monthlyCovers.map((cover) => ({
        monthName: cover.monthName,
        coverUrl: cover.game.cover_url,
        gameTitle: cover.game.title,
        sessionCount: cover.sessionCount,
        totalMinutes: cover.totalMinutes,
      })),
      backgroundCovers: resolveStoryBackgroundCovers(retrospective, {
        primaryCover: montageCovers[0],
        extraCovers: montageCovers.slice(1),
      }),
    });
  }

  slides.push({
    id: "outro",
    type: "outro",
    theme: "highlight",
    year: retrospective.year,
    playerName: retrospective.player.name,
    profileHref,
    backgroundCovers: defaultCovers(),
  });

  return slides;
}
