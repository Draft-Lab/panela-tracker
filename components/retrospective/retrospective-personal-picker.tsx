import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Player } from "@/lib/types";

interface RetrospectivePersonalPickerProps {
  players: Player[];
  year?: number;
}

export function RetrospectivePersonalPicker({
  players,
  year = new Date().getFullYear(),
}: RetrospectivePersonalPickerProps) {
  if (players.length === 0) return null;

  return (
    <section
      id="pessoal"
      className="scroll-mt-8 border-t border-border/30 pt-5"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/45">
          Por jogador
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/jogadores/${player.id}/retrospectiva?year=${year}`}
              title={`Stories · ${player.name}`}
              className="rounded-full opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={player.avatar_url ?? undefined} alt={player.name} />
                <AvatarFallback className="text-[9px]">
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
