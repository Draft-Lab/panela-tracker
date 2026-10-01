import { Orbit } from "lucide-react"

export function HomepageDynamoNote() {
  return <aside className="homepage-field-note homepage-dynamo-note" aria-label="Anotação do Dynamo, de Deadlock">
    <div className="homepage-field-note-paper">
      <span className="homepage-note-eyebrow"><Orbit size={13} aria-hidden="true" /> Teoria do Dynamo</span>
      <p>A próxima partida<br />é sempre a melhor.</p>
      <span className="homepage-note-source">anotado em algum lugar de Deadlock</span>
    </div>
    <img src="/panela-dynamo.webp" alt="Dynamo, o professor robô de Deadlock, levantando um dedo como quem tem uma teoria." width={400} height={500} loading="lazy" decoding="async" />
  </aside>
}
