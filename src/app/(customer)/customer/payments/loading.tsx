import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerPaymentsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading billing receipts"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading billing receipts</span>

      {/* Header */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Receipts Ledger Card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-sm space-y-4">
        <Skeleton className="h-9 w-64 rounded-xl" />

        <div className="divide-y divide-border/50 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36 font-mono" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

