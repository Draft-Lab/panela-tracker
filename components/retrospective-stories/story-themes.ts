import type { PlayerStorySlide } from "./build-player-slides";

export type StoryThemeId = PlayerStorySlide["theme"];

export const STORY_THEMES: Record<
  StoryThemeId,
  {
    shell: string;
    accent: string;
    muted: string;
    card: string;
    glow: string;
  }
> = {
  default: {
    shell: "bg-background text-foreground",
    accent: "text-primary",
    muted: "text-muted-foreground",
    card: "rounded-xl border border-border/60 bg-card/90",
    glow: "from-primary/25 via-primary/5 to-transparent",
  },
  emphasis: {
    shell: "bg-card text-foreground",
    accent: "text-primary",
    muted: "text-muted-foreground",
    card: "rounded-xl border border-border/60 bg-background/80",
    glow: "from-chart-2/20 via-chart-3/5 to-transparent",
  },
  highlight: {
    shell: "bg-gradient-to-b from-primary/20 via-background to-background text-foreground",
    accent: "text-primary",
    muted: "text-muted-foreground",
    card: "rounded-xl border border-primary/20 bg-primary/10",
    glow: "from-primary/30 to-transparent",
  },
  cover: {
    shell: "bg-background text-foreground",
    accent: "text-primary",
    muted: "text-muted-foreground",
    card: "rounded-xl border border-border/60 bg-card/80",
    glow: "from-chart-4/20 to-transparent",
  },
};
