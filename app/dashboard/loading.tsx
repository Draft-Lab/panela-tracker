import { LandingSectionSkeleton } from "@/components/landing/skeletons/landing-section-skeleton";

export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="space-y-3">
        <div className="h-10 w-48 rounded-md bg-muted" />
        <div className="h-5 w-72 max-w-full rounded-md bg-muted" />
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-9 w-28 rounded-md bg-muted/70" />
          ))}
        </div>
      </div>

      <LandingSectionSkeleton variant="cards" />

      <div className="space-y-4">
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-xl border border-border/40 bg-muted/30"
            />
          ))}
        </div>
      </div>

      <LandingSectionSkeleton variant="heatmap" />
      <LandingSectionSkeleton variant="list" />
    </div>
  );
}
