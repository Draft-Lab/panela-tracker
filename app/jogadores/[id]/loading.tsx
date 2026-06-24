import { LandingHeader } from "@/components/landing/landing-header"
import { LandingShell } from "@/components/landing/landing-shell"
import { LandingSectionSkeleton } from "@/components/landing/skeletons/landing-section-skeleton"

export default function PlayerProfileLoading() {
  return (
    <LandingShell>
      <LandingHeader wide />

      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-24 lg:px-8 lg:pt-28">
        <div className="animate-pulse overflow-hidden rounded-[2rem] ring-1 ring-white/10">
          <div className="h-44 bg-muted/40 sm:h-52" />
          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-full bg-muted sm:h-24 sm:w-24" />
              <div className="space-y-2 pb-1">
                <div className="h-8 w-40 rounded-md bg-muted" />
                <div className="h-4 w-56 rounded-md bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:max-w-sm">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-muted/60" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-6 w-48 rounded-md bg-muted" />
              <LandingSectionSkeleton variant="list" />
            </div>
            <LandingSectionSkeleton variant="heatmap" />
          </div>
          <aside className="space-y-3">
            <div className="h-40 rounded-[1.5rem] bg-muted/30" />
            <div className="h-48 rounded-[1.5rem] bg-muted/30" />
          </aside>
        </div>
      </main>
    </LandingShell>
  )
}
