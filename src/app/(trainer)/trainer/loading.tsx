import { Skeleton } from "@/components/ui/skeleton";

export default function TrainerDashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading trainer portal"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading trainer portal</span>

      {/* Header */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Recent Activity Table Skeleton */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

