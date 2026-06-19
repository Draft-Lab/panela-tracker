import { GameCalendar } from "@/components/game-calendar/game-calendar";
import {
  PlayerProfilePanel,
  PlayerProfileSectionHeader,
} from "@/components/player-profile/player-profile-panel";
import type { JogatinaWithGame } from "@/lib/player-profile-helpers";

interface PlayerProfileCalendarSectionProps {
  jogatinas: JogatinaWithGame[];
  compact?: boolean;
}

export function PlayerProfileCalendarSection({
  jogatinas,
  compact = false,
}: PlayerProfileCalendarSectionProps) {
  return (
    <section>
      {!compact && <PlayerProfileSectionHeader title="Calendário pessoal" />}
      <PlayerProfilePanel padding="compact">
        <GameCalendar jogatinas={jogatinas} compact={compact} />
      </PlayerProfilePanel>
    </section>
  );
}
