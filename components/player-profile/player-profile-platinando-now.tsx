import type { PlayerPlatinumGame } from "@/lib/types";
import { getGameTitle } from "@/lib/player-platinum-helpers";

interface PlayerProfilePlatinandoNowProps {
  entry: PlayerPlatinumGame;
}

export function PlayerProfilePlatinandoNow({
  entry,
}: PlayerProfilePlatinandoNowProps) {
  return (
    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm">
      <PlatinumIndicator className="h-1.5 w-1.5" />
      <span className="shrink-0 text-muted-foreground">Platinando</span>
      <span className="truncate font-medium text-amber-400">
        {getGameTitle(entry)}
      </span>
    </p>
  );
}

export function PlatinumIndicator({ className }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 shrink-0 ${className ?? ""}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
    </span>
  );
}

export function PlatinandoBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-amber-400">
      <PlatinumIndicator className="h-1.5 w-1.5" />
      Platinando
    </span>
  );
}

export function PlatinadoBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-amber-400">
      Platinado
    </span>
  );
}
