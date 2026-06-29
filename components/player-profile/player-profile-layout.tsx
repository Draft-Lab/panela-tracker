"use client";

import { useState } from "react";
import { PlayerProfileSidebarNav, type PlayerProfileView } from "@/components/player-profile/player-profile-sidebar-nav";
import { PlayerProfileSidebar } from "@/components/player-profile/player-profile-sidebar";
import { PlayerProfileSeasons } from "@/components/player-profile/player-profile-seasons";
import { PlayerProfileRecentGames } from "@/components/player-profile/player-profile-recent-games";
import { PlayerProfileActivitySection } from "@/components/player-profile/player-profile-activity-section";
import { PlayerProfileGameLibrary } from "@/components/player-profile/player-profile-game-library";
import { PlayerProfileCalendarSection } from "@/components/player-profile/player-profile-calendar-section";
import { PlayerProfilePlatinumSection } from "@/components/player-profile/player-profile-platinum-section";
import type {
  JogatinaWithGame,
  PlayerActiveSeasonEntry,
  PlayerParticipationDay,
  PlayerProfileGameEntry,
  PlayerProfileSummary,
} from "@/lib/player-profile-helpers";
import type { PlayerPlatinumGame } from "@/lib/types";

interface PlayerProfileLayoutProps {
  summary: PlayerProfileSummary;
  seasons: PlayerActiveSeasonEntry[];
  library: PlayerProfileGameEntry[];
  recentGames: PlayerProfileGameEntry[];
  participationDays: PlayerParticipationDay[];
  calendarJogatinas: JogatinaWithGame[];
  platinando: PlayerPlatinumGame | null;
  platinados: PlayerPlatinumGame[];
}

export function PlayerProfileLayout({
  summary,
  seasons,
  library,
  recentGames,
  participationDays,
  calendarJogatinas,
  platinando,
  platinados,
}: PlayerProfileLayoutProps) {
  const [activeView, setActiveView] = useState<PlayerProfileView>("overview");

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
      <div className="min-w-0">
        {activeView === "overview" && (
          <div className="space-y-5">
            <PlayerProfilePlatinumSection
              platinando={platinando}
              platinados={platinados}
            />
            <PlayerProfileRecentGames games={recentGames} />
            <PlayerProfileActivitySection participationDays={participationDays} />
          </div>
        )}

        {activeView === "library" && (
          <PlayerProfileGameLibrary games={library} />
        )}

        {activeView === "calendar" && (
          <PlayerProfileCalendarSection jogatinas={calendarJogatinas} />
        )}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
        <PlayerProfileSidebarNav
          activeView={activeView}
          onViewChange={setActiveView}
          libraryCount={library.length}
        />
        <PlayerProfileSidebar summary={summary} />
        <PlayerProfileSeasons seasons={seasons} />
      </aside>
    </div>
  );
}
