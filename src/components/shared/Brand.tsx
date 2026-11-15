import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
export function Brand({
  compact = false,
  href = "/?preview=true",
  className,
}: {
  compact?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="GYM-OS home"
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 text-foreground",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-cream">
        <Dumbbell className="size-[19px]" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.6px]">
          GYM-OS
          <span className="ml-0.5 align-top text-[9px] text-muted-foreground">
            ®
          </span>
        </span>
      )}
    </Link>
  );
}
