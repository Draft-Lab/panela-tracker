import { LandingPlayerProfileCard } from "@/components/landing-player-profile-card";
import type { PlayerAchievement } from "@/lib/player-achievements";
import type { Player } from "@/lib/types";

export interface LandingPlayerCardStats {
  player: Player;
  totalSessions: number;
  totalMinutes: number;
  dropCount: number;
  achievements?: PlayerAchievement[];
}

interface LandingPlayerProfilesProps {
  playerStats: LandingPlayerCardStats[];
}

export function LandingPlayerProfiles({
  playerStats,
}: LandingPlayerProfilesProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {playerStats.map((stat) => (
        <LandingPlayerProfileCard
          key={stat.player.id}
          player={stat.player}
          totalSessions={stat.totalSessions}
          totalMinutes={stat.totalMinutes}
          dropCount={stat.dropCount}
          achievements={stat.achievements ?? []}
        />
      ))}
    </div>
  );
}
