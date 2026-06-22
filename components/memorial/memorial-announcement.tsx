import { MemorialReveal } from "@/components/memorial/memorial-reveal"
import { MemorialSection } from "@/components/memorial/memorial-section"

export function MemorialAnnouncement() {
  return (
    <MemorialSection
      title="O anúncio"
      description="O encerramento oficial dos servidores marcou o fim de uma era. O vídeo abaixo registra o momento em que a comunidade se despediu."
    >
      <MemorialReveal delay={60}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-muted/20">
          <iframe
            src="https://www.youtube.com/embed/wBmClCPOHeU"
            title="Supervive - Anúncio de encerramento"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </MemorialReveal>

      <MemorialReveal delay={120} className="mt-6">
        <blockquote className="max-w-2xl border-l-2 border-primary/30 pl-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Agradecemos a cada jogador que entrou na fila, gravou clipes e
            manteve o jogo vivo enquanto durou. O legado continua nas histórias
            que ainda contamos.
          </p>
        </blockquote>
      </MemorialReveal>
    </MemorialSection>
  )
}
