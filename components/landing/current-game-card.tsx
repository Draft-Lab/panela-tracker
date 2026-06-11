import { Badge } from "@/components/ui/badge"
import { Users, Gamepad2, X } from "lucide-react"
import type { Jogatina, Game, JogatinaPlayer, Player } from "@/lib/types"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline"

interface CurrentGameCardProps {
  jogatina: Jogatina & {
    game: Game
    jogatina_players?: (JogatinaPlayer & { player: Player })[]
  }
  isInteractive?: boolean
  onFinish?: (jogatinaId: string, gameTitle: string) => void
}

export function CurrentGameCard({
  jogatina,
  isInteractive = false,
  onFinish,
}: CurrentGameCardProps) {
  const activePlayers = jogatina.jogatina_players?.filter((jp) => jp.is_active) || []
  const sessionType = activePlayers.length > 1 ? "Grupo" : "Solo"
  const coverUrl = jogatina.game.cover_url

  return (
    <article className="relative overflow-hidden rounded-xl border border-border/50">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center blur-lg brightness-[0.55] saturate-125"
            />
            <div className="absolute inset-0 bg-background/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/15 to-background/25" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-card/30 to-background" />
        )}
      </div>

      <div className="relative z-10 flex gap-4 p-5">
        <div
          className={cn(
            "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted shadow-md ring-1",
            coverUrl ? "ring-white/15" : "ring-border/60",
          )}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={jogatina.game.title}
              fill
              sizes="64px"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/80">
              <Gamepad2 className="h-7 w-7 text-muted-foreground" strokeWidth={1.75} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="truncate text-base font-semibold text-foreground">
              {jogatina.game.title}
            </p>
            <GameIgdbMetaInline
              game={jogatina.game}
              variant="chips"
              className="mt-1.5"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="animate-pulse border-green-500/40 bg-green-500/15 text-green-400 backdrop-blur-sm"
              >
                Ao vivo
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "backdrop-blur-sm",
                  sessionType === "Solo"
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                    : "border-purple-500/40 bg-purple-500/15 text-purple-400",
                )}
              >
                {sessionType}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>
              {activePlayers.length}{" "}
              {activePlayers.length === 1 ? "jogador ativo" : "jogadores ativos"}
            </span>
          </div>

          {activePlayers.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Jogando agora:</p>
              <div className="flex flex-wrap gap-3">
                {activePlayers.map((jp) => (
                  <div key={jp.player.id} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 ring-1 ring-border/60">
                      {jp.player.avatar_url && (
                        <AvatarImage
                          src={jp.player.avatar_url || "/placeholder.svg"}
                          alt={jp.player.name}
                        />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {jp.player.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{jp.player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isInteractive && onFinish && (
            <Button
              size="sm"
              variant="destructive"
              className="backdrop-blur-sm"
              onClick={() => onFinish(jogatina.id, jogatina.game.title)}
            >
              <X className="mr-1 h-4 w-4" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
