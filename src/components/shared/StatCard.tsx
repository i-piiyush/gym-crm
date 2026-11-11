import React from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  formatValue?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "destructive";
  };
  progress?: {
    value: number;
    max: number;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  formatValue,
  prefix,
  suffix,
  icon: Icon,
  description,
  badge,
  progress,
  className,
}: StatCardProps) {
  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case "success":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300";
      case "warning":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
      case "destructive":
        return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const progressPercentage = progress
    ? Math.min(100, Math.round((progress.value / progress.max) * 100))
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        {prefix && (
          <span className="text-lg font-bold text-muted-foreground">{prefix}</span>
        )}
        <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
          <AnimatedNumber value={value} format={formatValue} />
        </div>
        {suffix && (
          <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
        )}
      </div>

      {progress && progressPercentage !== null && (
        <div className="mt-3 space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercentage >= 100
                  ? "bg-rose-500"
                  : progressPercentage >= 80
                  ? "bg-amber-500"
                  : "bg-primary"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>
              {progress.value} of {progress.max} capacity
            </span>
            <span>{progressPercentage}%</span>
          </div>
        </div>
      )}

      {(description || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {description && (
            <span className="text-muted-foreground truncate">{description}</span>
          )}
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                getBadgeStyle()
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

