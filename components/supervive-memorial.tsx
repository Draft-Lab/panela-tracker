'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Share2, MessageCircle } from 'lucide-react'

export function Supervivememorial() {
  const [showMemories, setShowMemories] = useState(false)
  const [memories, setMemories] = useState<string[]>([
    'O melhor jogo de Royale que já joguei, comunidade incrível!',
    'Lembranças incríveis com amigos no Supervive. RIP.',
    'Um jogo à frente de seu tempo. Viva Supervive!',
  ])
  const [newMemory, setNewMemory] = useState('')

  const handleAddMemory = () => {
    if (newMemory.trim()) {
      setMemories([newMemory, ...memories])
      setNewMemory('')
    }
  }

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

            {/* Timeline of Journey */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">O Anúncio</h3>
              <div className="border-l-2 border-primary/30 pl-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Os servidores finais de Supervive foram desligados, marcando o encerramento oficial de uma era. Foi uma decisão difícil que afetou toda a comunidade que construímos juntos.
                </p>
                <p className="text-xs text-primary/60 font-medium">
                  Somos eternamente gratos a todos os jogadores que fizeram parte dessa jornada extraordinária.
                </p>
              </div>
            </div>

            {/* Memory Wall Section */}
            <div className="space-y-4 border-t border-primary/10 pt-8">
              <h3 className="text-xl font-bold text-foreground">Compartilhe Suas Memórias</h3>
              <p className="text-sm text-muted-foreground">
                Deixe sua marca nos anais da história de Supervive. Compartilhe seus momentos favoritos, vitórias memoráveis e amizades construídas.
              </p>

              {/* Memory Input */}
              <div className="flex gap-2 pt-2">
                <textarea
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="Compartilhe uma lembrança, um momento especial ou uma mensagem de agradecimento..."
                  className="flex-1 min-h-24 p-3 rounded-lg bg-primary/5 border border-primary/20 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary/40 focus:bg-primary/10 transition-colors"
                />
              </div>
              <Button
                onClick={handleAddMemory}
                disabled={!newMemory.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Heart className="w-4 h-4 mr-2" />
                Adicionar Memória
              </Button>

              {/* Toggle Memory Display */}
              <Button
                variant="outline"
                onClick={() => setShowMemories(!showMemories)}
                className="w-full border-primary/20 hover:bg-primary/5"
              >
                {showMemories ? 'Ocultar' : 'Ver'} Memórias da Comunidade ({memories.length})
              </Button>

              {/* Memory Display */}
              {showMemories && (
                <div className="space-y-3 pt-4 max-h-96 overflow-y-auto">
                  {memories.map((memory, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors"
                    >
                      <p className="text-sm text-foreground leading-relaxed">{memory}</p>
                      <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="w-3 h-3" />
                          <span>Apreciar</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          <span>Responder</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Share2 className="w-3 h-3" />
                          <span>Compartilhar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Closing Message */}
            <div className="border-t border-primary/10 pt-8 text-center space-y-4">
              <p className="text-base text-muted-foreground font-medium">
                🎮 Obrigado a Todos os Heróis de Supervive 🎮
              </p>
              <p className="text-sm text-muted-foreground">
                Você estará para sempre em nossos corações. Que suas jornadas continuem em novos mundos e que as amizades forjadas aqui permaneçam eternas.
              </p>
              <div className="flex gap-3 justify-center flex-wrap pt-2">
                <Button variant="outline" size="sm" className="border-primary/20 bg-transparent">
                  Relembrar Estatísticas
                </Button>
                <Button variant="outline" size="sm" className="border-primary/20 bg-transparent">
                  Galeria de Momentos
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
