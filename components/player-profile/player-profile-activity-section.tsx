import { PlayerProfileHeatmap } from "@/components/player-profile/player-profile-heatmap";
import {
  PlayerProfilePanel,
  PlayerProfileSectionHeader,
} from "@/components/player-profile/player-profile-panel";
import type { PlayerParticipationDay } from "@/lib/player-profile-helpers";

interface PlayerProfileActivitySectionProps {
  participationDays: PlayerParticipationDay[];
}

export function PlayerProfileActivitySection({
  participationDays,
}: PlayerProfileActivitySectionProps) {
  return (
    <section>
      <PlayerProfileSectionHeader title="Atividade nos últimos 12 meses" />
      <PlayerProfilePanel padding="compact" className="sm:p-5">
        <PlayerProfileHeatmap participationDays={participationDays} />
      </PlayerProfilePanel>
    </section>
  );
}
