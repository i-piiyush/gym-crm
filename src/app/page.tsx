import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserFromClerk } from "@/services/auth.service";
import prisma from "@/db/client";
import { ROLE_HOME_ROUTES, ROUTES } from "@/constants/routes";
import { LuDumbbell } from "react-icons/lu";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    let userRole: string | null = null;

    try {
      const existing = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, status: true },
      });

      if (existing && existing.status === "ACTIVE" && existing.role) {
        userRole = existing.role;
      } else {
        const sync = await syncUserFromClerk(userId);
        if (sync.user) {
          userRole = sync.user.role;
        }
      }
    } catch (err) {
      console.warn("Retrying database sync after wake-up delay:", err);
      try {
        const sync = await syncUserFromClerk(userId);
        if (sync.user) {
          userRole = sync.user.role;
        }
      } catch (retryErr) {
        console.error("Database connection failed after retry:", retryErr);
      }
    }

    if (userRole) {
      const destination = ROLE_HOME_ROUTES[userRole as keyof typeof ROLE_HOME_ROUTES];
      if (destination) {
        redirect(destination);
      }
    }

    redirect(ROUTES.NOT_INVITED);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-6">
        <LuDumbbell className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Gym CRM Platform
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        High-performance multi-tenant operations, 15-second rotating GPS attendance geofencing, subscription lifecycle, and billing.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href={ROUTES.SIGN_IN}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-emerald-700 shadow-sm transition-colors"
        >
          Sign In
        </Link>
        <Link
          href={ROUTES.SIGN_UP}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-8 text-sm font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
