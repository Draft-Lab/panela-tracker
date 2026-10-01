/** Paired Doorman references double as shortcuts between distant stops. */
export function HomepagePortal({ tone }: { tone: "blue" | "gold" }) {
  const blue = tone === "blue"
  const label = blue ? "Entrar no portal azul: ir para Momentos marcantes" : "Entrar no portal dourado: voltar para Atividade"
  return <a className={`homepage-portal homepage-portal-${tone}`} href={blue ? "#destaques" : "#atividade"} aria-label={label} title={blue ? "Portal para os recordes" : "Portal para a atividade"}>
    <img src={`/panela-portal-${tone}.webp`} alt="" width={180} height={240} loading="lazy" decoding="async" />
  </a>
}
