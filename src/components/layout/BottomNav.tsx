"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoleType } from "@/constants/roles";
import { ROLE_NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  role: UserRoleType;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  // Take primary 4 items for clean mobile bottom bar
  const navItems = (ROLE_NAVIGATION[role] || []).slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/90 px-3 backdrop-blur-xl lg:hidden">
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
              "apple-button-press relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
              isActive
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform",
                isActive ? "scale-105 text-foreground" : "text-muted-foreground"
              )}
            />
            <span className="truncate">{item.title}</span>
            {isActive && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
