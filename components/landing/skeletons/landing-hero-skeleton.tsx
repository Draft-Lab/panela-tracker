export function LandingHeroSkeleton() {
  return (
    <div className="grid animate-pulse items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
      <div className="max-w-lg space-y-3">
        <div className="h-4 w-24 rounded-md bg-muted" />
        <div className="h-9 w-56 rounded-md bg-muted" />
        <div className="h-4 w-full max-w-md rounded-md bg-muted" />
        <div className="h-4 w-4/5 max-w-sm rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-20 rounded-md bg-muted" />
            <div className="h-8 w-16 rounded-md bg-muted" />
            <div className="h-3 w-14 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
