"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import {
  PlayerProfilePanel,
  PlayerProfileSectionHeader,
} from "@/components/player-profile/player-profile-panel";
import { RecentGameItems } from "@/components/player-profile/player-profile-recent-games-items";
import { Button } from "@/components/ui/button";
import type { PlayerProfileGameEntry } from "@/lib/player-profile-helpers";
import { cn } from "@/lib/utils";

interface PlayerProfileRecentGamesProps {
  games: PlayerProfileGameEntry[];
}

type RecentGamesView = "grid" | "list";

export function PlayerProfileRecentGames({ games }: PlayerProfileRecentGamesProps) {
  const [view, setView] = useState<RecentGamesView>("list");

  if (games.length === 0) {
    return (
      <PlayerProfilePanel className="py-12 text-center text-muted-foreground">
        Nenhum jogo recente registrado
      </PlayerProfilePanel>
    );
  }

  return (
    <section>
      <PlayerProfileSectionHeader
        title="Jogados recentemente"
        description="Ordenado pela última sessão registrada"
        action={
          <ViewToggle view={view} onViewChange={setView} />
        }
      />

      {view === "list" ? (
        <PlayerProfilePanel padding="compact">
          <RecentGameItems games={games} view="list" />
        </PlayerProfilePanel>
      ) : (
        <RecentGameItems games={games} view="grid" />
      )}
    </section>
  );
}

function ViewToggle({
  view,
  onViewChange,
}: {
  view: RecentGamesView;
  onViewChange: (view: RecentGamesView) => void;
}) {
  return (
    <div
      className="flex shrink-0 rounded-lg border border-border/50 bg-background/40 p-0.5"
      role="group"
      aria-label="Modo de visualização"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          view === "grid" && "bg-muted text-foreground shadow-sm",
        )}
        aria-pressed={view === "grid"}
        aria-label="Visualização em grade"
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          view === "list" && "bg-muted text-foreground shadow-sm",
        )}
        aria-pressed={view === "list"}
        aria-label="Visualização em lista"
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
