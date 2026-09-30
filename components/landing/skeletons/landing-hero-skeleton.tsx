export function LandingHeroSkeleton() {
  return <div className="homepage-hero-stats" role="status" aria-label="Carregando resumo do grupo">
    {Array.from({ length: 4 }, (_, i) => <div key={i} className="homepage-stat"><div className="homepage-stat-placeholder motion-safe:animate-pulse" /><span>Carregando…</span></div>)}
  </div>
}
