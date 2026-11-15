import { Skeleton } from "@/components/ui/skeleton";

export default function TrainerSalaryLoading() {
  return (
    <div
      role="status"
      aria-label="Loading salary statements"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading salary statements</span>

      {/* Header */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Statements Table */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm space-y-4">
        <div className="divide-y divide-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

