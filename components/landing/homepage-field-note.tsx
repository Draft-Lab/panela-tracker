import { Moon, Sparkles } from "lucide-react"

/** A small SUPERVIVE reference in the field guide, away from the hero. */
export function HomepageFieldNote() {
  return <aside className="homepage-field-note" aria-label="Lembrete da Elluna, de SUPERVIVE">
    <div className="homepage-field-note-paper">
      <span className="homepage-note-eyebrow"><Moon size={13} aria-hidden="true" /> Lembrete da Elluna</span>
      <p>Ninguém fica pra trás.<br />Até o próximo lobby!</p>
      <span className="homepage-note-source">uma lembrança de SUPERVIVE</span>
    </div>
    <img src="/panela-elluna.webp" alt="Elluna, a coelhinha azul de SUPERVIVE, espiando sobre a anotação." width={400} height={600} loading="lazy" decoding="async" />
    <Sparkles className="homepage-note-sparkle" size={18} aria-hidden="true" />
  </aside>
}
