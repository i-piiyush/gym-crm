"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoleType } from "@/constants/roles";
import { ROLE_NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { LuDumbbell } from "react-icons/lu";

interface SidebarProps {
  role: UserRoleType;
  gymName?: string;
}

export function Sidebar({ role, gymName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = ROLE_NAVIGATION[role] || [];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LuDumbbell className="h-5 w-5" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-bold tracking-tight text-foreground">
            {gymName || "Gym CRM"}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {role.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/trainer" &&
              item.href !== "/customer" &&
              item.href !== "/super-admin" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.title}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

