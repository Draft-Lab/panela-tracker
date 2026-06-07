import { MemorialReveal } from "@/components/memorial/memorial-reveal"

export function MemorialAnnouncement() {
  return (
    <section className="border-t border-border/60 pt-12 lg:pt-16">
      <MemorialReveal>
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            O anúncio
          </h2>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
            O encerramento oficial dos servidores marcou o fim de uma era para
            quem jogou desde o começo. O vídeo abaixo registra o momento em que
            a comunidade se despediu.
          </p>
        </div>
      </MemorialReveal>

      <MemorialReveal delay={80} className="mt-8">
        <div className="relative aspect-video w-full overflow-hidden border border-border/60 bg-muted/30">
          <iframe
            src="https://www.youtube.com/embed/wBmClCPOHeU"
            title="Supervive - Anúncio de encerramento"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </MemorialReveal>

      <MemorialReveal delay={140} className="mt-6">
        <blockquote className="max-w-2xl border-l-2 border-primary/40 pl-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Agradecemos a cada jogador que entrou na fila, gravou clipes e
            manteve o jogo vivo enquanto durou. O legado continua nas histórias
            que ainda contamos.
          </p>
        </blockquote>
      </MemorialReveal>
    </section>
  )
}
