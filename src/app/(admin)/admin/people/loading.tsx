import { Skeleton } from "@/components/ui/skeleton";

export default function PeopleLoading() {
  return (
    <div
      role="status"
      aria-label="Loading people directory"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Loading people directory</span>

      {/* Header */}
      <div
        aria-hidden="true"
        className="space-y-2 pb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 sm:h-9 sm:w-80" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Tabs / Filter bar */}
      <div aria-hidden="true" className="flex items-center gap-3 border-b border-border pb-3">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-60 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>

        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

