import { notFound } from "next/navigation";
import { PlayerProfileContent } from "@/components/player-profile/player-profile-content";
import { loadPlayerProfile } from "@/lib/load-player-profile";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadPlayerProfile(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-10">
      <PlayerProfileContent data={data} variant="admin" />
    </div>
  );
}
