import type { LandingHeroData } from "@/lib/fetch-landing-data"

export function buildHomepageHeadline(data: LandingHeroData) {
  const names = data.members.filter(member => member.isPlayingNow).map(member => member.name)
  const people = names.length > 2 ? `${names.slice(0, 2).join(", ")} e mais ${names.length - 2}` : names.join(" e ")
  const number = new Intl.NumberFormat("pt-BR")
  if (data.currentGamesCount > 0) return {
    tag: "Plantão do lobby",
    title: data.currentGamesCount === 1 ? "Tem partida. Tem história." : `${data.currentGamesCount} partidas. Uma só panela.`,
    description: people ? `${people} ${names.length === 1 ? "está em jogo" : "estão em jogo"}. O próximo capítulo já começou.` : "Há sessões em andamento. A noite ainda tem muito pra contar.",
    fact: `${number.format(data.totalHours)} horas de jogos registradas pelo grupo.`,
    href: "#agora",
    cta: "Espiar o lobby",
  }
  return {
    tag: "Edição entre partidas",
    title: data.totalHours >= 100 ? `Já são ${number.format(Math.floor(data.totalHours / 100) * 100)} horas de histórias.` : "Toda panela começa com uma partida.",
    description: "O lobby está em silêncio por enquanto. As histórias continuam guardadas por aqui.",
    fact: `${number.format(data.playersCount)} jogadores fazem parte da panela.`,
    href: "#timeline",
    cta: "Folhear as últimas sessões",
  }
}

export function getLobbyReaction(sessionCount: number, activePlayers: number, hasGroup: boolean) {
  if (sessionCount === 0) return { mood: "sleep", image: "/panela-mascot-sleep.webp", message: "Me acorda na próxima partida.", note: "O mascote descansa enquanto não há sessões em andamento." }
  if (hasGroup && activePlayers >= 3) return { mood: "cheer", image: "/panela-mascot-cheer.webp", message: "A turma está reunida!", note: `${activePlayers} jogadores ativos nas sessões do lobby. Já dá pra ouvir a comemoração.` }
  return { mood: "dynamo", image: "/panela-dynamo.webp", message: sessionCount === 1 ? "Uma partida, infinitas teorias." : `${sessionCount} partidas. A noite promete.`, note: "O Dynamo acompanha as sessões em andamento. A teoria de hoje: só mais uma." }
}
