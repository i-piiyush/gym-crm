import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROLE_HOME_ROUTES } from "./constants/routes";
import { ClerkPublicMetadata } from "./types/auth.types";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/not-invited",
  "/api/webhooks(.*)",
  "/api/receipts/(.*)",
]);

const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isTrainerRoute = createRouteMatcher(["/trainer(.*)"]);
const isCustomerRoute = createRouteMatcher(["/customer(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Allow public routes immediately
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Not logged in -> redirect to Clerk sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const metadata =
    (sessionClaims?.publicMetadata as ClerkPublicMetadata) ||
    ((sessionClaims as Record<string, unknown>)?.metadata as ClerkPublicMetadata) ||
    {};
  const role = metadata.role;

  // Root or landing page: redirect to role dashboard if role is known in token
  if (req.nextUrl.pathname === "/") {
    if (role && ROLE_HOME_ROUTES[role]) {
      return NextResponse.redirect(new URL(ROLE_HOME_ROUTES[role], req.url));
    }
    // If role is not yet in JWT claims, let request pass through to src/app/page.tsx
    // which queries the DB via syncUserFromClerk and redirects appropriately
    return NextResponse.next();
  }

  // Fast middleware role protection if role is present in session claims
  if (role) {
    if (isSuperAdminRoute(req) && role !== "SUPER_ADMIN") {
      const redirectTarget = ROLE_HOME_ROUTES[role] || "/not-invited";
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }

    if (isAdminRoute(req) && role !== "ADMIN") {
      const redirectTarget = ROLE_HOME_ROUTES[role] || "/not-invited";
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }

    if (isTrainerRoute(req) && role !== "TRAINER") {
      const redirectTarget = ROLE_HOME_ROUTES[role] || "/not-invited";
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }

    if (isCustomerRoute(req) && role !== "CUSTOMER") {
      const redirectTarget = ROLE_HOME_ROUTES[role] || "/not-invited";
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }
  }

  // If role is not yet in token, let request through to the portal layout
  // where getPortalSession() verifies against the database (the source of truth)
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

