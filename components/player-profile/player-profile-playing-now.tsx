import type { PlayerCurrentlyPlaying } from "@/lib/player-profile-helpers";

interface PlayerProfilePlayingNowProps {
  session: PlayerCurrentlyPlaying;
}

export function PlayerProfilePlayingNow({ session }: PlayerProfilePlayingNowProps) {
  return (
    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm">
      <LiveIndicator className="h-1.5 w-1.5" />
      <span className="shrink-0 text-muted-foreground">Jogando</span>
      <span className="truncate font-medium text-emerald-400">
        {session.gameTitle}
      </span>
      {session.sessionType === "group" && (
        <span className="shrink-0 text-xs text-muted-foreground">· grupo</span>
      )}
    </p>
  );
}

export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 shrink-0 ${className ?? ""}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

export function PlayingNowBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-400">
      <LiveIndicator className="h-1.5 w-1.5" />
      Ao vivo
    </span>
  );
}
