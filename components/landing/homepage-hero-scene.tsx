import { ArrowUpRight } from "lucide-react"

export function HomepageHeroScene() {
  return <div className="homepage-hero-scene">
    <link rel="preload" as="image" href="/panela-rooftop-mobile.webp" media="(max-width: 767px)" fetchPriority="high" />
    <link rel="preload" as="image" href="/panela-rooftop.webp" media="(min-width: 768px)" fetchPriority="high" />
    <div className="homepage-hero-copy">
      <p className="homepage-kicker">Panela Tracker · o histórico da nossa jogatina</p>
      <h1>A noite é<br /><span>da panela.</span></h1>
      <p className="homepage-hero-description">Só mais uma partida. E uma história inteira pra contar.</p>
      <a href="#agora" className="homepage-cta">Ver o que está rolando <ArrowUpRight size={18} /></a>
    </div>
    <div className="homepage-hero-art homepage-hero-rooftop">
      <picture>
        <source media="(max-width: 767px)" srcSet="/panela-rooftop-mobile.webp" />
        <img src="/panela-rooftop.webp" alt="Amigos jogando em um terraço à noite, reunidos em volta de uma panela iluminada, com a cidade ao fundo." width={1536} height={1024} fetchPriority="high" decoding="async" />
      </picture>
    </div>
    <span className="homepage-scroll-note" aria-hidden="true">A jogatina continua por aqui ↓</span>
  </div>
}
