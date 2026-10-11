type HomepageChapterProps = {
  tone: "blue" | "green" | "gold"
  number: string
  label: string
  note: string
}

export function HomepageChapter({ tone, number, label, note }: HomepageChapterProps) {
  const district = {
    blue: { art: "/panela-lobby-corner.webp", title: "Praça do lobby", text: "O ponto de encontro. Aqui a gente descobre quem chegou, o que está rolando e como foi a semana.", href: "#agora", cta: "Entrar na praça", secret: "O banco está reservado. O horário de ir embora, ninguém combinou." },
    green: { art: "/panela-arcade-store.webp", title: "Beco do fliperama", text: "Os jogos que juntam a turma, os procurados da noite e as notícias que correm pelo bairro.", href: "#jogos", cta: "Visitar o fliperama", secret: "Ficha aceita: uma boa companhia. Os jogos do mural seguem o ranking real de sessões em grupo." },
    gold: { art: "/panela-guild-archive.webp", title: "Arquivo da guilda", text: "Cada jogador tem uma ficha. Cada sessão deixa uma marca. Nada disso se perde por aqui.", href: "#perfis", cta: "Abrir o arquivo", secret: "Arquivado com carinho. As carteirinhas abrem as estatísticas de cada membro; os perfis guardam o restante da história." },
  }[tone]
  return <div className={`homepage-chapter homepage-district homepage-zone-${tone}`} data-homepage-chapter={tone === "blue" ? undefined : tone}>
    <div className="homepage-district-copy">
    <p className="homepage-chapter-note">{note}</p>
    <div className="homepage-chapter-sign"><span aria-hidden="true">{number}</span><p>{label}</p></div>
    <h2>{district.title}</h2><p className="homepage-district-description">{district.text}</p>
    <a className="homepage-district-door" href={district.href}>{district.cta}<span aria-hidden="true">↗</span></a>
    </div>
    <div className="homepage-district-art"><img src={district.art} alt={`Cenário ilustrado: ${district.title}.`} width={450} height={300} loading="lazy" decoding="async" /><details className="homepage-district-secret"><summary>Bilhete da vizinhança<span>toque para abrir</span></summary><p>{district.secret}</p></details></div>
  </div>
}
