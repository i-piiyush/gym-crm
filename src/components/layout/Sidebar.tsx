"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoleType } from "@/constants/roles";
import { ADMIN_NAV_SECTIONS, ROLE_NAVIGATION, NavSection } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Building2, ChevronRight, Sparkles } from "lucide-react";

interface SidebarProps {
  role: UserRoleType;
  gymName?: string;
  userName?: string;
}

export function Sidebar({ role, gymName, userName }: SidebarProps) {
  const pathname = usePathname();

  // If Admin, use structured sections; otherwise flat list grouped by section
  const sections: NavSection[] =
    role === "ADMIN"
      ? ADMIN_NAV_SECTIONS
      : [
          {
            title: "MENU",
            items: ROLE_NAVIGATION[role] || [],
          },
        ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[rgba(40,40,40,0.08)] bg-[#FAFAF8] select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP BRAND & FACILITY IDENTIFIER */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col border-b border-[rgba(40,40,40,0.07)] px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#242424] transition-opacity hover:opacity-85"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#242424] text-white shadow-sm">
            <span className="font-mono text-xs font-bold tracking-tighter">OS</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-[#242424]">GYM-OS</span>
            <span className="text-[10px] font-medium text-[#71697a]">2.0</span>
          </div>
        </Link>

        {/* Facility Card */}
        <div className="mt-3.5 flex items-center justify-between rounded-xl border border-[rgba(40,40,40,0.06)] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f2f6d0] text-[#242424]">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-[#242424]">
                {gymName || "Active Facility"}
              </span>
              <span className="text-[10px] text-[#71697a]">
                {role === "ADMIN" ? "Gym Operations" : role.replace("_", " ")}
              </span>
            </div>
          </div>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. STRUCTURED NAVIGATION LIST */}
      {/* -------------------------------------------------------------------- */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3.5 py-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-[#71697a] uppercase">
              {section.title}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item) => {
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
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-white text-[#242424] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[rgba(40,40,40,0.06)]"
                        : "text-[#71697a] hover:bg-stone-100/70 hover:text-[#242424]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-[#242424]"
                          : "text-[#71697a] group-hover:text-[#242424]"
                      )}
                    />
                    <span className="truncate">{item.title}</span>

                    {item.badge && (
                      <span className="ml-auto rounded-full bg-[#d0e1d4]/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#242424]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* -------------------------------------------------------------------- */}
      {/* 3. BOTTOM FOOTER BAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="border-t border-[rgba(40,40,40,0.07)] p-3">
        <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[rgba(40,40,40,0.06)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4be9e]/50 text-xs font-semibold text-[#242424]">
              {userName ? userName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-[#242424]">
                {userName || "Administrator"}
              </span>
              <span className="text-[10px] text-[#71697a] capitalize">
                {role.toLowerCase().replace("_", " ")}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#71697a]">v2.0</span>
        </div>
      </div>
    </aside>
  );
}
