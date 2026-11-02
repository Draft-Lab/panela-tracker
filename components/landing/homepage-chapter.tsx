type HomepageChapterProps = {
  tone: "blue" | "green" | "gold"
  number: string
  label: string
  note: string
}

export function HomepageChapter({ tone, number, label, note }: HomepageChapterProps) {
  const district = {
    blue: null,
    green: { art: "/panela-arcade-store.webp", title: "Beco do fliperama", text: "Os jogos que juntam a turma, os procurados da noite e as notícias que correm pelo bairro.", href: "#jogos", cta: "Visitar o fliperama" },
    gold: { art: "/panela-guild-archive.webp", title: "Arquivo da guilda", text: "Cada jogador tem uma ficha. Cada sessão deixa uma marca. Nada disso se perde por aqui.", href: "#perfis", cta: "Abrir o arquivo" },
  }[tone]
  return <div className={`homepage-chapter homepage-district homepage-zone-${tone}${district ? "" : " homepage-district-intro"}`} data-homepage-chapter={tone === "blue" ? undefined : tone}>
    <div className="homepage-district-copy">
    <p className="homepage-chapter-note">{note}</p>
    <div className="homepage-chapter-sign"><span aria-hidden="true">{number}</span><p>{label}</p></div>
    {district && <><h2>{district.title}</h2><p className="homepage-district-description">{district.text}</p>
    <a className="homepage-district-door" href={district.href}>{district.cta}<span aria-hidden="true">↗</span></a></>}
    </div>
    {district ? <div className="homepage-district-art"><img src={district.art} alt={`Cenário ilustrado: ${district.title}.`} width={450} height={300} loading="lazy" decoding="async" /></div> : <img className="homepage-christmas-scene" src="/panela-natal-praca.webp" alt="" width={1400} height={580} loading="lazy" decoding="async" />}
  </div>
}
