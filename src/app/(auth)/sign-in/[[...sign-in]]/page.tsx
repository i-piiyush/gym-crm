import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex justify-center" suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading sign-in form...
          </div>
        }
      >
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-sm border border-border rounded-xl",
              formButtonPrimary:
                "bg-primary hover:bg-emerald-700 text-primary-foreground text-sm font-medium",
            },
          }}
        />
      </Suspense>
    </div>
  );
}
