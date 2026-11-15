import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerAttendanceLoading() {
  return (
    <div
      role="status"
      aria-label="Loading workout attendance"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading workout attendance</span>

      {/* Header */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* 2 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      {/* History Feed */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm space-y-4">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <div className="divide-y divide-border/50 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

