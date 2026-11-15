"use client";
import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { PageLoader } from "@/components/shared/PageLoader";

export function LoginForm() {
  return (
    <div className="w-full">
      <ClerkLoading><PageLoader label="Loading secure sign in…" className="min-h-64" /></ClerkLoading>
      <ClerkLoaded>
        <SignIn routing="path" path="/sign-in" withSignUp={false} fallbackRedirectUrl="/" appearance={{
          elements: { footerAction: "hidden" },
        }} />
      </ClerkLoaded>
    </div>
  );
}
