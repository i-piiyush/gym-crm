import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading member portal"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading member portal</span>

      {/* Header */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* 2 Pass / Trainer Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* 3 KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/80 bg-surface p-5 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Recent Check-Ins */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
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

