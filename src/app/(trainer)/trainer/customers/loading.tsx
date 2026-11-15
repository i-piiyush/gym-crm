import { Skeleton } from "@/components/ui/skeleton";

export default function TrainerCustomersLoading() {
  return (
    <div
      role="status"
      aria-label="Loading assigned clients"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading assigned clients</span>

      {/* Header */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm space-y-4">
        {/* Search bar skeleton */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border/50 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-44" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

