import { createClient } from "@/lib/supabase/server";
import { GameCalendar } from "@/components/game-calendar/game-calendar";

export default async function CalendarioPage() {
  const supabase = await createClient();

  const { data: jogatinas, error } = await supabase
    .from("jogatinas")
    .select("*, game:games(*)")
    .order("last_event_at", { ascending: false, nullsFirst: false })
    .order("date", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("[calendario] Error fetching jogatinas:", error);
  }

  const gameJogatinas =
    jogatinas?.filter((j) => j.game && !j.game.is_app) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold text-foreground">
          Calendário de jogatinas
        </h1>
        <p className="text-muted-foreground">
          Veja qual jogo o grupo jogou em cada dia do mês
        </p>
      </div>

      <GameCalendar jogatinas={gameJogatinas} />
    </div>
  );
}
