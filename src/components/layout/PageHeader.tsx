import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between border-b border-border">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[30px] font-semibold tracking-[-.8px] text-foreground sm:text-[34px]">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-3 flex items-center gap-2.5 sm:mt-0">{action}</div>
      )}
    </div>
  );
}
