"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoleType } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { ADMIN_NAV_SECTIONS, ROLE_NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  QrCode,
  Search,
  Building2,
  CalendarCheck2,
  Bell,
  Sparkles,
} from "lucide-react";

interface TopbarProps {
  role: UserRoleType;
  gymName?: string;
  userName?: string;
}

export function Topbar({ role, gymName, userName }: TopbarProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[rgba(40,40,40,0.08)] bg-[#FAFAF8]/85 px-4 backdrop-blur-xl sm:h-16 lg:px-8">
        {/* Left: Mobile Menu Toggle & Gym Identifier */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(40,40,40,0.08)] bg-white text-[#242424] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-sm font-semibold tracking-tight text-[#242424]">
              {gymName || "GYM-OS"}
            </span>
          </div>

          {/* Desktop Breadcrumb/Facility Tag */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-[#71697a]">
            <span>{gymName || "GYM-OS"}</span>
            <span className="text-stone-300">•</span>
            <span className="capitalize text-[#242424]">
              {pathname === "/admin"
                ? "Overview"
                : pathname.split("/").filter(Boolean).pop()?.replace("-", " ") || "Dashboard"}
            </span>
          </div>
        </div>

        {/* Center: Subtle Search Pill (Simulated Command Trigger) */}
        <div className="hidden md:flex items-center">
          <div className="flex h-8 w-64 items-center gap-2 rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-3 text-xs text-[#71697a] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <Search className="h-3.5 w-3.5 text-[#858585]" />
            <span className="flex-1">Search members, records...</span>
            <kbd className="rounded border border-[rgba(40,40,40,0.1)] bg-stone-50 px-1.5 py-0.5 text-[10px] font-mono text-[#858585]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick check-in shortcut for customers & trainers */}
          {(role === "CUSTOMER" || role === "TRAINER") && (
            <Link
              href={ROUTES.CHECKIN}
              className="apple-button-press inline-flex items-center gap-1.5 rounded-full bg-[#d0e1d4]/50 px-3 py-1 text-xs font-medium text-[#242424] hover:bg-[#d0e1d4]"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Check In</span>
            </Link>
          )}

          {/* Reception Launch for Admin */}
          {role === "ADMIN" && (
            <Link
              href={ROUTES.ADMIN.ATTENDANCE_QR}
              className="hidden sm:inline-flex apple-button-press items-center gap-1.5 rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-3 py-1 text-xs font-medium text-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-stone-50"
            >
              <QrCode className="h-3.5 w-3.5 text-[#71697a]" />
              <span>Launch QR</span>
            </Link>
          )}

          {/* User Name Preview */}
          {userName && (
            <span className="hidden text-xs font-medium text-[#71697a] sm:inline-block">
              {userName}
            </span>
          )}

          {/* Clerk UserButton Profile */}
          <div className="flex h-8 w-8 items-center justify-center">
            {mounted ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-8 w-8 ring-1 ring-[rgba(40,40,40,0.12)] transition-shadow hover:ring-[rgba(40,40,40,0.3)]",
                  },
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-stone-200 animate-pulse" />
            )}
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* MOBILE APPLE-STYLE SHEET DRAWER */}
      {/* -------------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-[#FAFAF8] shadow-2xl border-r border-[rgba(40,40,40,0.09)]">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-[rgba(40,40,40,0.07)] px-5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#242424] text-white text-[10px] font-bold">
                  OS
                </div>
                <span className="text-sm font-semibold text-[#242424]">GYM-OS</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71697a] hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-4">
              {(role === "ADMIN" ? ADMIN_NAV_SECTIONS : [{ title: "MENU", items: ROLE_NAVIGATION[role] || [] }]).map(
                (sec, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#71697a]">
                      {sec.title}
                    </p>
                    {sec.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                            isActive
                              ? "bg-white text-[#242424] font-semibold shadow-sm border border-[rgba(40,40,40,0.06)]"
                              : "text-[#71697a] hover:bg-stone-100"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )
              )}
            </nav>

            {/* Bottom Facility */}
            <div className="border-t border-[rgba(40,40,40,0.07)] p-4 text-xs text-[#71697a]">
              <p className="font-medium text-[#242424]">{gymName || "Active Facility"}</p>
              <p className="text-[11px]">Signed in as {userName || "Staff"}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
