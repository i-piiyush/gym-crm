"use client";
import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import { PageLoader } from "@/components/shared/PageLoader";

export function InvitationForm() {
  return <>
    <ClerkLoading><PageLoader label="Loading your invitation…" className="min-h-64" /></ClerkLoading>
    <ClerkLoaded><SignUp routing="virtual" signInUrl="/sign-in" fallbackRedirectUrl="/" /></ClerkLoaded>
  </>;
}
