import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceLoading() {
  return (
    <div
      role="status"
      aria-label="Loading attendance logs"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Loading attendance logs</span>

      {/* Header */}
      <div
        aria-hidden="true"
        className="space-y-2 pb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 sm:h-9 sm:w-80" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      {/* Controls & Tabs */}
      <div aria-hidden="true" className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Attendance Check-in Logs List */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

