import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading settings"
      aria-busy="true"
      className="space-y-6 max-w-4xl"
    >
      <span className="sr-only">Loading settings</span>

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

      {/* Membership Plans CRUD Section */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/80 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-6 w-24" />
              <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facility Profile Section */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/70 p-4 space-y-2"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Geofence Notice Section */}
      <div
        aria-hidden="true"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-5 w-60" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

