import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { JogatinaWithDetails } from "@/lib/types";
import { JOGATINA_STATUS_STYLES } from "@/lib/jogatina-display-helpers";
import { cn } from "@/lib/utils";

interface JogatinaListPlayersProps {
  jogatina: JogatinaWithDetails;
  compact?: boolean;
}

export function JogatinaListPlayers({
  jogatina,
  compact = false,
}: JogatinaListPlayersProps) {
  const players = jogatina.jogatina_players ?? [];
  if (players.length === 0) return null;

  const visibleAvatars = players.slice(0, compact ? 4 : 6);

  return (
    <div className={cn("space-y-2.5", compact && "mt-3")}>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {visibleAvatars.map((jp) => (
            <Avatar
              key={jp.id}
              className={cn(
                "border-2 border-background ring-1 ring-border/40",
                compact ? "h-7 w-7" : "h-8 w-8",
              )}
              title={jp.player.name}
            >
              <AvatarImage
                src={jp.player.avatar_url || undefined}
                alt={jp.player.name}
              />
              <AvatarFallback className="text-[9px]">
                {jp.player.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        {players.length > visibleAvatars.length && (
          <span className="text-xs text-muted-foreground">
            +{players.length - visibleAvatars.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {players.map((jp) => {
          const showStatus = jp.status !== "Jogatina";

          return (
            <div
              key={jp.id}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-2 py-1",
                compact && "text-xs",
              )}
            >
              <span className="truncate font-medium">{jp.player.name}</span>
              {showStatus && (
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 shrink-0 px-1.5 text-[10px]",
                    JOGATINA_STATUS_STYLES[jp.status],
                  )}
                >
                  {jp.status}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
