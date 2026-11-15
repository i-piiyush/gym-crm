import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserFromClerk } from "@/services/auth.service";
import prisma from "@/db/client";
import { ROLE_HOME_ROUTES, ROUTES } from "@/constants/routes";
import { LandingPage } from "@/features/marketing/components/LandingPage";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const isPreview = params?.preview === "true";

  if (userId && !isPreview) {
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
      console.warn("Retrying database sync on home route:", err);
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
      const destination =
        ROLE_HOME_ROUTES[userRole as keyof typeof ROLE_HOME_ROUTES];
      if (destination) {
        redirect(destination);
      }
    }

    redirect(ROUTES.NOT_INVITED);
  }

  return <LandingPage />;
}
