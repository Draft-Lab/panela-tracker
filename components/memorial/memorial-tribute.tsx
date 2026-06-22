import { Users, Swords, Heart } from "lucide-react"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"
import { MemorialSection } from "@/components/memorial/memorial-section"

const MEMORIES = [
  {
    icon: Users,
    title: "Comunidade",
    body: "Milhares de jogadores em partidas simultâneas, clipes compartilhados e rivalidades saudáveis.",
  },
  {
    icon: Swords,
    title: "Batalhas em equipe",
    body: "Hero shooter em terceira pessoa que pedia coordenação e improviso a cada round.",
  },
  {
    icon: Heart,
    title: "No Panela",
    body: "Dropo trouxe a ideia, a galera testou junto e Supervive entrou na rotina do grupo.",
  },
] as const

export function MemorialTribute() {
  return (
    <MemorialSection
      title="O que ficou"
      description="Supervive foi mais que um jogo — era sessão de sexta à noite, call aberta e a sensação de que qualquer round podia virar highlight."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        <MemorialReveal>
          <div className="max-w-[65ch] space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              A arte, o ritmo das partidas e a comunidade criaram um legado que
              ainda aparece nas conversas do grupo.
            </p>
            <p>
              Quando os servidores foram desligados, a decisão pesou para todo
              mundo que construiu história dentro do jogo. O que permanece são
              as vitórias, os fails engraçados e as amizades que nasceram nas
              filas.
            </p>
          </div>
        </MemorialReveal>

        <MemorialReveal delay={80}>
          <div className="grid gap-3 md:grid-cols-3">
            {MEMORIES.map((memory) => {
              const Icon = memory.icon
              return (
                <article
                  key={memory.title}
                  className="rounded-xl border border-border/50 bg-card/20 p-4 sm:p-5"
                >
                  <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                  <h3 className="mt-3 text-sm font-semibold">{memory.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {memory.body}
                  </p>
                </article>
              )
            })}
          </div>
        </MemorialReveal>
      </div>
    </MemorialSection>
  )
}
