export function LandingHeroSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-10 py-6 lg:gap-12 lg:py-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-14">
        <div className="max-w-lg space-y-4">
          <div className="h-4 w-36 rounded-md bg-muted" />
          <div className="h-14 w-full max-w-md rounded-md bg-muted" />
          <div className="h-4 w-full max-w-sm rounded-md bg-muted" />
          <div className="h-10 w-48 rounded-full bg-muted" />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-[108px] rounded-[2rem] bg-muted/40 p-1.5 sm:col-span-2 lg:col-span-1">
              <div className="h-full rounded-[calc(2rem-0.375rem)] bg-card/50" />
            </div>
            <div className="h-[108px] rounded-[2rem] bg-muted/40 p-1.5">
              <div className="h-full rounded-[calc(2rem-0.375rem)] bg-card/50" />
            </div>
            <div className="h-[108px] rounded-[2rem] bg-muted/40 p-1.5">
              <div className="h-full rounded-[calc(2rem-0.375rem)] bg-card/50" />
            </div>
          </div>
          <div className="h-[88px] rounded-[2rem] bg-muted/40 p-1.5">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-card/50" />
          </div>
          <div className="hidden gap-1.5 lg:ml-auto lg:flex">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-7 w-7 rounded-full bg-muted/50 ring-1 ring-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
