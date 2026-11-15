import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageLoader({ label = "Loading your workspace…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn("flex min-h-[45vh] flex-col items-center justify-center gap-4 py-12 text-muted-foreground", className)}>
      <LoaderCircle aria-hidden="true" className="size-7 animate-spin text-foreground motion-reduce:animate-none" strokeWidth={1.5} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
