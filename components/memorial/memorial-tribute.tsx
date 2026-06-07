import { Users, Swords, Heart } from "lucide-react"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"

const MEMORIES = [
  {
    icon: Users,
    title: "Comunidade",
    body: "Milhares de jogadores em partidas simultâneas, clipes compartilhados e rivalidades saudáveis.",
  },
  {
    icon: Swords,
    title: "Batalhas em equipe",
    body: "Mecânica de hero shooter em terceira pessoa que pedia coordenação e improviso a cada round.",
  },
  {
    icon: Heart,
    title: "No Panela",
    body: "Dropo trouxe a ideia, a galera testou junto e Supervive entrou na rotina do grupo.",
  },
] as const

export function MemorialTribute() {
  return (
    <section className="border-t border-border/60 pt-12 lg:pt-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <MemorialReveal>
          <div className="max-w-[65ch] space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              O que ficou
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Supervive foi mais que um jogo. Era sessão de sexta à noite, call
              aberta e aquela sensação de que qualquer round podia virar highlight.
              A arte, o ritmo das partidas e a comunidade criaram um legado que
              ainda aparece nas conversas do grupo.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Quando os servidores foram desligados, a decisão pesou para todo
              mundo que construiu história dentro do jogo. O que permanece são as
              vitórias, os fails engraçados e as amizades que nasceram nas filas.
            </p>
          </div>
        </MemorialReveal>

        <MemorialReveal delay={100}>
          <div className="grid gap-3 sm:grid-cols-2">
            {MEMORIES.map((memory, index) => {
              const Icon = memory.icon
              return (
                <article
                  key={memory.title}
                  className={
                    index === 0
                      ? "col-span-full border border-primary/20 bg-primary/5 p-6 sm:p-7"
                      : "border border-border/60 bg-muted/20 p-5"
                  }
                >
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                  <h3
                    className={
                      index === 0
                        ? "mt-4 text-lg font-semibold"
                        : "mt-3 text-base font-semibold"
                    }
                  >
                    {memory.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {memory.body}
                  </p>
                </article>
              )
            })}
          </div>
        </MemorialReveal>
      </div>
    </section>
  )
}
