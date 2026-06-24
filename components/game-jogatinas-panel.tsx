"use client";

import type { JogatinaWithDetails, Player } from "@/lib/types";
import { JogatinaList } from "@/components/jogatina-list";
import { Badge } from "@/components/ui/badge";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

interface GameJogatinasPanelProps {
  jogatinas: JogatinaWithDetails[];
  allPlayers: Player[];
}

export function GameJogatinasPanel({
  jogatinas,
  allPlayers,
}: GameJogatinasPanelProps) {
  return (
    <DashboardPanel innerClassName="flex flex-col p-0">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Jogatinas</h2>
          <Badge variant="secondary" className="tabular-nums">
            {jogatinas.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Role para ver o histórico
        </p>
      </div>

      <div className="game-panel-scroll max-h-[min(70vh,720px)] min-h-[280px] overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        <JogatinaList
          jogatinas={jogatinas}
          allPlayers={allPlayers}
          variant="compact"
          hideGameTitle
        />
      </div>
    </DashboardPanel>
  );
}
