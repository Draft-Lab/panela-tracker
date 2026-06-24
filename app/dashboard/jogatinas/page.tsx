import { createClient } from "@/lib/supabase/server";
import { JogatinaList } from "@/components/jogatina-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default async function JogatinasPage() {
  const supabase = await createClient();

  const { data: jogatinas, error } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(
        *,
        player:players(*)
      )
    `,
    )
    .order("date", { ascending: false });

  const { data: allPlayers } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[v0] Error fetching jogatinas:", error);
  }

  return (
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Todas as jogatinas"
        description="Histórico completo de sessões, agrupado por data"
      />

      <JogatinaList jogatinas={jogatinas || []} allPlayers={allPlayers || []} />
    </div>
  );
}
