import { Skeleton } from "@/components/ui/skeleton";

export default function TrialsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading trial members"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Loading trial members</span>

      {/* Header */}
      <div
        aria-hidden="true"
        className="space-y-2 pb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 sm:h-9 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </div>

      {/* Trials Table Skeleton */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>

        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-28 hidden sm:block" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

