import React from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  formatValue?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
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
  trend,
  badge,
  progress,
  className,
}: StatCardProps) {
  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case "success":
        return "bg-honeydew/50 text-status-active-fg border-border";
      case "warning":
        return "bg-desert/50 text-status-warning-fg border-border";
      case "destructive":
        return "bg-status-danger-bg text-status-danger-fg border-rose-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const progressPercentage = progress
    ? Math.min(
        100,
        Math.round((progress.value / Math.max(1, progress.max)) * 100),
      )
    : null;

  return (
    <div
      className={cn(
        "apple-card relative flex flex-col justify-between p-5 transition-all sm:p-6",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline gap-1">
          {prefix && (
            <span className="text-base font-medium text-muted-foreground">
              {prefix}
            </span>
          )}
          <span className="tabular-nums text-[30px] font-semibold tracking-tight text-foreground">
            <AnimatedNumber value={value} format={formatValue} />
          </span>
          {suffix && (
            <span className="text-xs font-medium text-muted-foreground">{suffix}</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        {progress && progressPercentage !== null ? (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPercentage >= 100
                    ? "bg-status-danger-bg0"
                    : progressPercentage >= 80
                      ? "bg-desert"
                      : "bg-[#71697a]",
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>
                {progress.value} of {progress.max} capacity
              </span>
              <span className="tabular-nums">{progressPercentage}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1">
            {description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </p>
            )}
            {badge && (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  getBadgeStyle(),
                )}
              >
                {badge.text}
              </span>
            )}
            {trend && (
              <span
                className={cn(
                  "shrink-0 text-[11px] font-medium",
                  trend.isPositive ? "text-status-active-fg" : "text-muted-foreground",
                )}
              >
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
