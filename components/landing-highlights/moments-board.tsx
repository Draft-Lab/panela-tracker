import type { LucideIcon } from "lucide-react"
import { LandingCoverThumb } from "@/components/landing/landing-glass-cell"
import type { Game } from "@/lib/types"

export interface MomentRecord {
  key: string
  game: Game
  label: string
  icon: LucideIcon
  badge: string
  meta: string
}

export function MomentsBoard({ moments }: { moments: MomentRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/[0.10] bg-card/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3 sm:px-7">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Arquivo da Panela
        </span>
        <span className="font-mono text-[10px] tabular-nums text-primary/80">
          {String(moments.length).padStart(2, "0")} registros
        </span>
      </div>

      <ol className="divide-y divide-white/[0.08]">
        {moments.map((moment, index) => {
          const Icon = moment.icon

          return (
            <li
              key={moment.key}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 px-5 py-5 transition-colors duration-300 hover:bg-primary/[0.045] sm:grid-cols-[2.5rem_minmax(0,1.2fr)_minmax(12rem,0.8fr)] sm:items-center sm:gap-x-5 sm:px-7"
            >
              <span className="pt-1 font-mono text-xs tabular-nums text-primary/70">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex min-w-0 items-center gap-3.5">
                <LandingCoverThumb
                  src={moment.game.cover_url}
                  alt={moment.game.title}
                  size="md"
                  imageSizes="52px"
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    <Icon className="size-3.5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                    {moment.label}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
                    {moment.game.title}
                  </h3>
                </div>
              </div>

              <div className="col-start-2 mt-3 min-w-0 sm:col-auto sm:mt-0 sm:border-l sm:border-white/[0.08] sm:pl-5">
                <p className="text-xl font-semibold leading-tight tracking-tight text-foreground tabular-nums sm:text-2xl">
                  {moment.badge}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {moment.meta}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
