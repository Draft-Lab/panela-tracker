import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LandingHeroMember } from "@/lib/fetch-landing-data";
import { cn } from "@/lib/utils";

interface LandingHeroMemberAvatarsProps {
  members: LandingHeroMember[];
  className?: string;
}

export function LandingHeroMemberAvatars({
  members,
  className,
}: LandingHeroMemberAvatarsProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Membros do grupo"
      className={cn("flex w-fit max-w-full flex-wrap gap-1.5", className)}
    >
      {members.map((member) => {
        const initials = member.name.slice(0, 2).toUpperCase();
        const isPlaying = member.isPlayingNow;

        return (
          <Link
            key={member.id}
            href={`/jogadores/${member.id}`}
            title={isPlaying ? `${member.name} — jogando agora` : member.name}
            className={cn(
              "shrink-0 rounded-full p-px",
              "transition-[transform,box-shadow,ring-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "hover:shadow-[0_2px_12px_rgba(0,0,0,0.22)] active:scale-[0.96]",
              isPlaying
                ? "bg-emerald-400/10 ring-[1.5px] ring-emerald-400/90"
                : "bg-white/[0.03] ring-1 ring-white/10 hover:ring-white/18",
            )}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={member.avatar_url || undefined}
                alt={member.name}
              />
              <AvatarFallback className="text-[9px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        );
      })}
    </nav>
  );
}
