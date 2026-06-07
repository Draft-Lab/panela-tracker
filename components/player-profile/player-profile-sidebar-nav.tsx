"use client";

import { Calendar, Gamepad2, LayoutGrid } from "lucide-react";
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
    <nav className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const count = id === "library" ? libraryCount : undefined;
        const isActive = activeView === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            className={cn(
              "flex w-full items-center justify-between border-b border-border/40 px-4 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40",
              isActive && "bg-muted/50 font-medium",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </span>
            {count !== undefined && (
              <span className="tabular-nums text-muted-foreground">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
