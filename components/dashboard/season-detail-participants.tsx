import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DashboardPanel } from "@/components/dashboard/dashboard-panel"
import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { glassSubtle } from "@/lib/glass-styles"
import type { SeasonParticipant } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SeasonDetailParticipantsProps {
  participants: (SeasonParticipant & { player: { name?: string; avatar_url?: string | null } })[]
}

function statusBadgeClass(status?: string | null) {
  if (status === "Zero") return "text-green-400 border-green-500/40"
  if (status === "Dropo") return "text-red-400 border-red-500/40"
  if (status === "Dava pra jogar") return "text-yellow-400 border-yellow-500/40"
  return ""
}

export function SeasonDetailParticipants({
  participants,
}: SeasonDetailParticipantsProps) {
  return (
    <DashboardSection title="Participantes e status">
      <DashboardPanel innerClassName="p-0">
        <div className="divide-y divide-white/[0.06]">
          {participants.map((sp) => (
            <div
              key={sp.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-1 ring-white/10">
                  <AvatarImage src={sp.player?.avatar_url || undefined} />
                  <AvatarFallback>
                    {sp.player?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{sp.player?.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{sp.total_sessions || 0} sessões</span>
                    <span>
                      {Math.floor((sp.total_duration_minutes || 0) / 60)}h jogadas
                    </span>
                    {sp.solo_duration_minutes > 0 && (
                      <span>{Math.floor(sp.solo_duration_minutes / 60)}h solo</span>
                    )}
                    {sp.group_duration_minutes > 0 && (
                      <span>{Math.floor(sp.group_duration_minutes / 60)}h grupo</span>
                    )}
                  </div>
                  {sp.notes && (
                    <p className="mt-1 text-sm italic text-muted-foreground">{sp.notes}</p>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0", glassSubtle, statusBadgeClass(sp.status))}
              >
                {sp.status || "Em andamento"}
              </Badge>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </DashboardSection>
  )
}
