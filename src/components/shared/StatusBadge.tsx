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
        return "bg-[#d0e1d4]/50 text-emerald-900 border-[rgba(40,40,40,0.06)]";
      case "TRIAL":
      case "PENDING":
      case "EXPIRING":
      case "INVITED":
      case "PENDING_OWNER":
        return "bg-[#e4be9e]/45 text-[#8c5222] border-[rgba(40,40,40,0.06)]";
      case "EXPIRED":
      case "FAILED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200/80";
      case "INACTIVE":
      case "SUSPENDED":
      case "REVOKED":
      default:
        return "bg-[#d9d2b6]/35 text-[#71697a] border-[rgba(40,40,40,0.06)]";
    }
  };

  const displayLabel = label || normalized.replace("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors",
        getStyle(),
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {displayLabel}
    </span>
  );
}
