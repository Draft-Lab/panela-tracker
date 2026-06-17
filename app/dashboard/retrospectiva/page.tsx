import { createClient } from "@/lib/supabase/server";
import { RetrospectiveHero } from "@/components/retrospective/retrospective-hero";
import { RetrospectivePersonalPicker } from "@/components/retrospective/retrospective-personal-picker";
import { RetrospectiveYearNav } from "@/components/retrospective/retrospective-year-nav";
import { RetrospectiveYearView } from "@/components/retrospective/retrospective-year-view";
import { filterJogatinasByYear } from "@/lib/retrospective-helpers";
import {
  buildMonthlyRetrospective,
  buildYearSummary,
  getAvailableYears,
  parseYearParam,
  type RetrospectiveJogatina,
} from "@/lib/retrospective-helpers";

interface RetrospectivaPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function RetrospectivaPage({
  searchParams,
}: RetrospectivaPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: jogatinas } = await supabase
    .from("jogatinas")
    .select(`
      *,
      game:games(*),
      jogatina_players(*, player:players(*))
    `)
    .order("date", { ascending: false });

  const { data: jogatinaPlayers } = await supabase
    .from("jogatina_players")
    .select(`
      *,
      player:players(*),
      jogatina:jogatinas(*, game:games(*))
    `);

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  const gameJogatinas = (jogatinas?.filter((j) => !j.game?.is_app) ||
    []) as RetrospectiveJogatina[];
  const gameJogatinaPlayers =
    jogatinaPlayers?.filter((jp) => !jp.jogatina?.game?.is_app) || [];

  const availableYears = getAvailableYears(gameJogatinas);
  const year = parseYearParam(params.year, availableYears);
  const summary = buildYearSummary(gameJogatinas, gameJogatinaPlayers, year);
  const months = buildMonthlyRetrospective(
    gameJogatinas,
    gameJogatinaPlayers,
    year,
  );
  const yearJogatinas = filterJogatinasByYear(gameJogatinas, year);

  return (
    <div className="space-y-10">
      <RetrospectiveYearNav year={year} availableYears={availableYears} />

      <section className="space-y-4">
        <div className="relative inline-block">
          <div className="absolute -top-1 -left-1 h-6 w-px bg-primary/30" />
          <div className="absolute -top-1 -left-1 h-px w-6 bg-primary/30" />
          <h2 className="text-2xl font-bold">Destaques do ano</h2>
        </div>
        <RetrospectiveHero summary={summary} />
      </section>

      <RetrospectiveYearView
        year={year}
        months={months}
        jogatinas={yearJogatinas}
      />

      <RetrospectivePersonalPicker players={players ?? []} year={year} />
    </div>
  );
}
