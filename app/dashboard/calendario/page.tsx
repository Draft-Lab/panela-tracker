import { createClient } from "@/lib/supabase/server";
import { GameCalendar } from "@/components/game-calendar/game-calendar";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

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
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Calendário de jogatinas"
        description="Veja qual jogo o grupo jogou em cada dia do mês"
      />

      <GameCalendar jogatinas={gameJogatinas} />
    </div>
  );
}
