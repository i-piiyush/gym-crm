import { ReactNode } from "react";
import { LuDumbbell } from "react-icons/lu";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <LuDumbbell className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Gym CRM
        </span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

