import { getLobbyReaction } from "@/lib/homepage-story"

export function HomepageLobbyReaction({ sessionCount, activePlayers, hasGroup }: { sessionCount: number; activePlayers: number; hasGroup: boolean }) {
  const reaction = getLobbyReaction(sessionCount, activePlayers, hasGroup)
  return <aside className={`homepage-lobby-reaction homepage-lobby-reaction-${reaction.mood}`} aria-label="Recado do lobby">
    <div className="homepage-reaction-portrait">
      <img src={reaction.image} alt={reaction.mood === "cheer" ? "Mascote da panela comemorando." : reaction.mood === "sleep" ? "Mascote da panela cochilando." : "Dynamo acompanhando o lobby."} width={160} height={160} loading="lazy" decoding="async" />
      {reaction.mood !== "dynamo" && <img className="homepage-reaction-hover-pose" src="/panela-mascot.webp" alt="" aria-hidden="true" width={160} height={160} loading="lazy" decoding="async" />}
    </div>
    <details className="homepage-reaction-note"><summary>{reaction.message}<span>abrir recado</span></summary><p>{reaction.note}</p></details>
    {hasGroup && <div className="homepage-lobby-elluna"><img src="/panela-elluna.webp" alt="Elluna de olho nas sessões em grupo." width={90} height={135} loading="lazy" decoding="async" /><p>Ninguém fica pra trás.<span>Tem sessão em grupo no lobby.</span></p></div>}
  </aside>
}
