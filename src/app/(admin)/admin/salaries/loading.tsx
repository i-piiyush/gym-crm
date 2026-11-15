import { Skeleton } from "@/components/ui/skeleton";

export default function SalariesLoading() {
  return (
    <div
      role="status"
      aria-label="Loading payroll"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Loading payroll</span>

      {/* Header */}
      <div
        aria-hidden="true"
        className="space-y-2 pb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 sm:h-9 sm:w-80" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      {/* 3 Payroll Summary Cards */}
      <div
        aria-hidden="true"
        className="grid gap-4 sm:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Payroll Table Skeleton */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

