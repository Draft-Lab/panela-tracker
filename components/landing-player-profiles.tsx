import { buildLandingPlayerCardStats } from "@/lib/player-profile-helpers";
import { LandingPlayerProfileCard } from "@/components/landing-player-profile-card";
import type { Player, JogatinaPlayer, SeasonParticipant } from "@/lib/types";

interface LandingPlayerProfilesProps {
  players: Player[];
  jogatinaPlayers: JogatinaPlayer[];
  seasonParticipants: SeasonParticipant[];
}

export function LandingPlayerProfiles({
  players,
  jogatinaPlayers,
  seasonParticipants,
}: LandingPlayerProfilesProps) {
  const playerStats = players.map((player) =>
    buildLandingPlayerCardStats(player, jogatinaPlayers, seasonParticipants),
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {playerStats.map((stat) => (
        <LandingPlayerProfileCard
          key={stat.player.id}
          player={stat.player}
          totalSessions={stat.totalSessions}
          totalMinutes={stat.totalMinutes}
          dropCount={stat.dropCount}
          tags={stat.tags}
        />
      ))}
    </div>
  );
}
