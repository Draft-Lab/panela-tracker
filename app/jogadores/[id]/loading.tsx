import { LandingHeader } from "@/components/landing/landing-header";
import { LandingSectionSkeleton } from "@/components/landing/skeletons/landing-section-skeleton";

export default function PlayerProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 lg:px-8 lg:py-10">
        <div className="animate-pulse overflow-hidden rounded-xl border border-border/50">
          <div className="h-48 bg-muted/40 sm:h-56" />
          <div className="space-y-4 p-5 sm:p-7">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-full bg-muted sm:h-24 sm:w-24" />
              <div className="space-y-2 pb-1">
                <div className="h-8 w-40 rounded-md bg-muted" />
                <div className="h-4 w-56 rounded-md bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:ml-auto sm:max-w-[280px]">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-muted/60" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-6 w-48 rounded-md bg-muted" />
              <LandingSectionSkeleton variant="list" />
            </div>
            <LandingSectionSkeleton variant="heatmap" />
          </div>
          <aside className="space-y-3">
            <div className="h-40 rounded-xl border border-border/40 bg-muted/30" />
            <div className="h-48 rounded-xl border border-border/40 bg-muted/30" />
          </aside>
        </div>
      </main>
    </div>
  );
}
