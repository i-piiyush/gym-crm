import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(40,40,40,0.1)] bg-white/60 p-8 text-center sm:p-12 ${
        className || ""
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-[#71697a] border border-[rgba(40,40,40,0.05)] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[#242424]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#71697a]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
