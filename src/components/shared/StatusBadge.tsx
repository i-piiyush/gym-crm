import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case "ACTIVE":
      case "PAID":
      case "SENT":
      case "VERIFIED":
        return "bg-honeydew/50 text-status-active-fg border-border";
      case "TRIAL":
      case "PENDING":
      case "EXPIRING":
      case "INVITED":
      case "PENDING_OWNER":
        return "bg-desert/45 text-status-warning-fg border-border";
      case "EXPIRED":
      case "FAILED":
      case "CANCELLED":
        return "bg-status-danger-bg text-status-danger-fg border-rose-200/80";
      case "INACTIVE":
      case "SUSPENDED":
      case "REVOKED":
      default:
        return "bg-sand/35 text-muted-foreground border-border";
    }
  };

  const displayLabel =
    label ||
    normalized.charAt(0) +
      normalized.slice(1).toLowerCase().replaceAll("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors",
        getStyle(),
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {displayLabel}
    </span>
  );
}
