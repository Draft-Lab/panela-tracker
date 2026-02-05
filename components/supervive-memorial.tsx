'use client'

import { Card } from '@/components/ui/card'

export function Supervivememorial() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-12 h-px bg-primary/40" />
        <div className="absolute top-0 left-0 w-px h-12 bg-primary/40" />
        <div className="absolute top-0 right-0 w-12 h-px bg-primary/40" />
        <div className="absolute top-0 right-0 w-px h-12 bg-primary/40" />

        <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
          {/* Memorial Header Banner */}
          <div className="relative h-48 bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center border-b border-primary/10">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
            </div>
            
            <div className="relative text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-foreground text-balance">
                Supervive
              </div>
              <p className="text-lg text-muted-foreground text-balance">
                Um legado que viverá para sempre em nossas memórias
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 space-y-8">
            {/* Memorial Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Uma Homenagem</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Supervive foi mais que um jogo – era uma experiência que uniu jogadores de todo o mundo. Com sua inovadora mecânica de batalha real, arte visual deslumbrante e comunidade apaixonada, Supervive deixou uma marca indelével na história dos games.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Embora os servidores tenham sido encerrados em sua forma original, o espírito de Supervive continua vivo nos corações de seus jogadores. Cada vitória, cada estratégia memorável e cada amizade forjada em batalla permanece como um tesouro inestimável.
              </p>
            </div>

            {/* O Anúncio */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">O Anúncio</h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-primary/20">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/wBmClCPOHeU"
                  title="Supervive - Anúncio de Encerramento"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="border-l-2 border-primary/30 pl-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Os servidores finais de Supervive foram desligados, marcando o encerramento oficial de uma era. Foi uma decisão difícil que afetou toda a comunidade que construímos juntos.
                </p>
                <p className="text-xs text-primary/60 font-medium">
                  Somos eternamente gratos a todos os jogadores que fizeram parte dessa jornada extraordinária.
                </p>
              </div>
            </div>

            {/* Closing Message */}
            <div className="border-t border-primary/10 pt-8 text-center space-y-4">
              <p className="text-base text-muted-foreground font-medium">
                Obrigado a Todos os Heróis de Supervive
              </p>
              <p className="text-sm text-muted-foreground">
                Você estará para sempre em nossos corações. Que suas jornadas continuem em novos mundos e que as amizades forjadas aqui permaneçam eternas.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
