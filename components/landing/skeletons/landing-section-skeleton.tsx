import { cn } from "@/lib/utils";

type LandingSectionSkeletonVariant =
  | "cards"
  | "heatmap"
  | "list"
  | "profiles"
  | "metrics";

interface LandingSectionSkeletonProps {
  variant?: LandingSectionSkeletonVariant;
  className?: string;
}

export function LandingSectionSkeleton({
  variant = "cards",
  className,
}: LandingSectionSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {variant === "cards" && <CardsSkeleton />}
      {variant === "heatmap" && <HeatmapSkeleton />}
      {variant === "list" && <ListSkeleton />}
      {variant === "profiles" && <ProfilesSkeleton />}
      {variant === "metrics" && <MetricsSkeleton />}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-36 rounded-[2rem] border border-border/40 bg-muted/30"
        />
      ))}
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
      <div className="h-48 rounded-xl border border-border/40 bg-muted/30" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-muted/30" />
        ))}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-16 rounded-xl border border-border/40 bg-muted/30"
        />
      ))}
    </div>
  );
}

function ProfilesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-52 rounded-xl border border-border/40 bg-muted/30"
        />
      ))}
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="h-56 rounded-xl border border-border/40 bg-muted/30" />
      <div className="space-y-6">
        <div className="h-24 rounded-xl bg-muted/30" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-16 rounded-xl bg-muted/30" />
          <div className="h-16 rounded-xl bg-muted/30" />
        </div>
      </div>
    </div>
  );
}
