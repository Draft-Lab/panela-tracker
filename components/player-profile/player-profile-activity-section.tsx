import { PlayerProfileHeatmap } from "@/components/player-profile/player-profile-heatmap";
import type { PlayerParticipationDay } from "@/lib/player-profile-helpers";

interface PlayerProfileActivitySectionProps {
  participationDays: PlayerParticipationDay[];
}

export function PlayerProfileActivitySection({
  participationDays,
}: PlayerProfileActivitySectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Atividade nos últimos 12 meses</h2>
      <div className="rounded-xl border border-border/60 bg-card/30 p-4 sm:p-6">
        <PlayerProfileHeatmap participationDays={participationDays} />
      </div>
    </section>
  );
}
