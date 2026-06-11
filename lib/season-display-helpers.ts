import type { SeasonParticipant, SeasonWithDetails } from "@/lib/types";

export const SEASON_PARTICIPANT_STATUS_STYLES: Record<
  NonNullable<SeasonParticipant["status"]>,
  string
> = {
  "Em andamento": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Zero: "bg-green-500/10 text-green-400 border-green-500/30",
  Dropo: "bg-red-500/10 text-red-400 border-red-500/30",
  "Dava pra jogar": "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export function getSeasonDaysActive(season: SeasonWithDetails) {
  const end = season.ended_at ? new Date(season.ended_at) : new Date();

  return Math.max(
    0,
    Math.floor(
      (end.getTime() - new Date(season.started_at).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

export function getSeasonTotalMinutes(season: SeasonWithDetails) {
  return (
    season.season_participants?.reduce(
      (sum, participant) => sum + (participant.total_duration_minutes || 0),
      0,
    ) ?? 0
  );
}

export function formatSeasonPlaytime(minutes: number) {
  if (minutes <= 0) return "—";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function formatSeasonDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
