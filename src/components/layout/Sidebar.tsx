"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";
import { UserRoleType } from "@/constants/roles";
import {
  ADMIN_NAV_SECTIONS,
  ROLE_NAVIGATION,
  NavSection,
} from "@/config/navigation";
import { Brand } from "@/components/shared/Brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function NavigationItems({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: UserRoleType;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const sections: NavSection[] =
    role === "ADMIN"
      ? ADMIN_NAV_SECTIONS
      : [{ title: "WORKSPACE", items: ROLE_NAVIGATION[role] }];
  const links = sections.flatMap((s) => s.items);
  return (
    <nav aria-label="Workspace navigation" className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-medium tracking-[1.1px] text-dim/75">
              {section.title}
            </p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                (pathname.startsWith(item.href + "/") &&
                  !links.some(
                    (other) =>
                      other.href !== item.href &&
                      other.href.length > item.href.length &&
                      pathname.startsWith(other.href),
                  ) &&
                  item.href.split("/").length > 2);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors",
                    active
                      ? "bg-cream/75 font-medium text-foreground"
                      : "text-dim hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <item.icon
                    className="size-[17px] shrink-0"
                    strokeWidth={1.7}
                  />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
export function Sidebar({
  role,
  gymName,
  userName,
}: {
  role: UserRoleType;
  gymName?: string;
  userName?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-muted transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-[232px]",
      )}
    >
      <div
        className={cn(
          "flex h-[76px] items-center px-6",
          collapsed && "px-[22px]",
        )}
      >
        <Brand compact={collapsed} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-5">
        {!collapsed && (
          <div className="mb-7 flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-honeydew/45">
              <Building2 className="size-4 text-status-active-fg" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {gymName || "GYM-OS workspace"}
              </p>
              <p className="mt-0.5 text-[10px] capitalize text-dim">
                {role.toLowerCase().replace("_", " ")} workspace
              </p>
            </div>
          </div>
        )}
        <NavigationItems role={role} collapsed={collapsed} />
        <Link
          href="/help"
          title="Help & support"
          className={cn(
            "mt-6 flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] text-dim hover:bg-muted",
            collapsed && "justify-center px-0",
          )}
        >
          <HelpCircle className="size-[17px]" />
          {!collapsed && (
            <>
              Help & support
              <ArrowUpRight className="ml-auto size-3" />
            </>
          )}
        </Link>
      </div>
      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 px-2 py-2",
            collapsed && "justify-center px-0",
          )}
        >
          <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {userName || "Your account"}
              </p>
              <p className="mt-0.5 text-[10px] text-dim">
                Account & preferences
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen />
          ) : (
            <>
              <PanelLeftClose />
              <span className="ml-1 text-[11px]">Collapse sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
