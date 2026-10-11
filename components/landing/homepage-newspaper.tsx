import { ArrowUpRight, Radio } from "lucide-react"
import type { LandingHeroData } from "@/lib/fetch-landing-data"
import { buildHomepageHeadline } from "@/lib/homepage-story"

export function HomepageNewspaper({ data }: { data: LandingHeroData }) {
  const story = buildHomepageHeadline(data)
  return <article className="homepage-newspaper" aria-label="Manchete da panela">
    <div className="homepage-newspaper-masthead"><span>A Gazeta da Panela</span><span><Radio size={13} aria-hidden="true" />{story.tag}</span></div>
    <div className="homepage-newspaper-body">
      <img className="homepage-newspaper-radio" src="/panela-news-radio.webp" alt="Rádio ilustrado transmitindo as notícias da panela." width={300} height={200} loading="lazy" decoding="async" />
      <div className="homepage-newspaper-copy"><h2>{story.title}</h2><p>{story.description}</p><a href={story.href}>{story.cta}<ArrowUpRight size={15} aria-hidden="true" /></a></div>
      <details className="homepage-newspaper-stamp"><summary>Direto da panela<span>abrir o selo</span></summary><p>{story.fact}</p></details>
    </div>
    <div className="homepage-newspaper-bottom"><span>As notícias correm. A jogatina fica.</span><span>Arquivo vivo do grupo</span></div>
  </article>
}
