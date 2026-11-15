import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading subscription renewals"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Loading subscription renewals</span>

      {/* Header */}
      <div
        aria-hidden="true"
        className="space-y-2 pb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 sm:h-9 sm:w-96" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </div>

      {/* 4 Expiration Buckets Tabs */}
      <div
        aria-hidden="true"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Subscriptions Table Skeleton */}
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
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

