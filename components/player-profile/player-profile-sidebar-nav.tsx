"use client";

import { Calendar, Gamepad2, LayoutGrid } from "lucide-react";
import { PlayerProfilePanel } from "@/components/player-profile/player-profile-panel";
import { cn } from "@/lib/utils";

export type PlayerProfileView = "overview" | "library" | "calendar";

interface PlayerProfileSidebarNavProps {
  activeView: PlayerProfileView;
  onViewChange: (view: PlayerProfileView) => void;
  libraryCount: number;
}

const NAV_ITEMS: {
  id: PlayerProfileView;
  label: string;
  icon: typeof LayoutGrid;
  count?: number;
}[] = [
  { id: "overview", label: "Visão geral", icon: LayoutGrid },
  { id: "library", label: "Biblioteca", icon: Gamepad2 },
  { id: "calendar", label: "Calendário", icon: Calendar },
];

export function PlayerProfileSidebarNav({
  activeView,
  onViewChange,
  libraryCount,
}: PlayerProfileSidebarNavProps) {
  return (
    <PlayerProfilePanel padding="compact" className="p-2">
      <div className="grid grid-cols-1 gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const count = id === "library" ? libraryCount : undefined;
          const isActive = activeView === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {count !== undefined && (
                <span className="rounded-full bg-background/60 px-2 py-0.5 text-xs tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </PlayerProfilePanel>
  );
}
