import { LandingHeroMemberAvatars } from "@/components/landing/landing-hero-member-avatars"
import type { LandingHeroData } from "@/lib/fetch-landing-data"

export function LandingHero({ playersCount, currentGamesCount, totalHours, appHours, mostPlayedThisWeek, members }: LandingHeroData) {
  const number = new Intl.NumberFormat("pt-BR")
  return (
    <div className="homepage-hero-stats" aria-label="Visão geral do grupo">
      <div className="homepage-stat"><strong>{number.format(totalHours)}<small>h</small></strong><span>Tempo acumulado</span>
        <p>{appHours > 0 ? `+ ${number.format(appHours)}h em apps` : "Desde o primeiro registro"}</p></div>
      <div className="homepage-stat"><strong>{number.format(playersCount)}</strong><span>Jogadores na panela</span><LandingHeroMemberAvatars members={members} /></div>
      <div className="homepage-stat"><strong>{number.format(currentGamesCount)}</strong><span>Jogatinas agora</span><p>{currentGamesCount > 0 ? "A panela está em jogo" : "O próximo lobby espera"}</p></div>
      <div className="homepage-stat homepage-stat-game"><span>Mais jogado nesta semana</span><strong>{mostPlayedThisWeek}</strong><a href="#jogos">Ver ranking de jogos ↗</a></div>
    </div>
  )
}
