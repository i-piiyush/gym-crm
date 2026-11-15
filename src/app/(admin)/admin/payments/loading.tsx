import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading payments"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Loading payments</span>

      {/* Header */}
      <div
        aria-hidden="true"
        className="space-y-2 pb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 sm:h-9 sm:w-80" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Filter / Search Bar */}
      <div aria-hidden="true" className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Payments Table Skeleton */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

