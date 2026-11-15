import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceQrLoading() {
  return (
    <div
      role="status"
      aria-label="Loading QR station"
      aria-busy="true"
      className="max-w-2xl mx-auto py-8 space-y-6"
    >
      <span className="sr-only">Loading QR station</span>

      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-8 shadow-sm flex flex-col items-center text-center space-y-6"
      >
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* QR Code Canvas Placeholder */}
        <div className="p-4 bg-muted/40 rounded-2xl border border-border/80">
          <Skeleton className="h-64 w-64 rounded-xl" />
        </div>

        {/* Timer Bar */}
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Action button */}
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
    </div>
  );
}

