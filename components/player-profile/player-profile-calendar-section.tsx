import { GameCalendar } from "@/components/game-calendar/game-calendar";
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
      {!compact && (
        <h2 className="mb-4 text-xl font-bold">Calendário pessoal</h2>
      )}
      <GameCalendar jogatinas={jogatinas} compact={compact} />
    </section>
  );
}
