import type { JogatinaPlayer } from "@/lib/types";

export const JOGATINA_STATUS_STYLES: Record<
  JogatinaPlayer["status"],
  string
> = {
  Jogatina: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Dropo: "bg-red-500/10 text-red-400 border-red-500/30",
  Zero: "bg-green-500/10 text-green-400 border-green-500/30",
  "Dava pra jogar": "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export const JOGATINA_SOURCE_LABELS = {
  manual: "Manual",
  discord_bot: "Bot Discord",
} as const;

export const JOGATINA_SESSION_TYPE_LABELS = {
  solo: "Solo",
  group: "Grupo",
} as const;

export function formatJogatinaDuration(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatJogatinaDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
