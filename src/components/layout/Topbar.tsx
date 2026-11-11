"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { UserRoleType } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { LuQrCode } from "react-icons/lu";

interface TopbarProps {
  role: UserRoleType;
  gymName?: string;
  userName?: string;
}

export function Topbar({ role, gymName, userName }: TopbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col lg:hidden">
          <span className="text-sm font-bold tracking-tight text-foreground">
            {gymName || "Gym CRM"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {role.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick check-in link for trainers and customers */}
        {(role === "CUSTOMER" || role === "TRAINER") && (
          <Link
            href={ROUTES.CHECKIN}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <LuQrCode className="h-4 w-4" />
            <span>Check In</span>
          </Link>
        )}

        {/* User name display on larger screens */}
        {userName && (
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline-block">
            {userName}
          </span>
        )}

        <div className="h-8 w-8 flex items-center justify-center">
          {mounted ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
