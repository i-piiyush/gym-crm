import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="flex justify-center" suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="py-12 text-center text-xs text-dim animate-pulse">
            Loading secure sign-up...
          </div>
        }
      >
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#242424",
              colorText: "#242424",
              colorTextSecondary: "#71697a",
              colorBackground: "#FFFFFF",
              borderRadius: "0.875rem",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
            },
            elements: {
              rootBox: "w-full",
              card: "shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-border/80 rounded-2xl bg-surface p-6 sm:p-8",
              headerTitle: "font-semibold tracking-tight text-foreground text-xl",
              headerSubtitle: "text-dim text-xs",
              formButtonPrimary:
                "bg-foreground hover:bg-foreground/90 text-background text-xs font-medium rounded-full py-2.5 active:scale-[0.98] transition-all shadow-none",
              formFieldInput:
                "rounded-xl border border-border/70 bg-[#F5F5F3] focus:bg-surface focus:border-foreground/30 text-xs text-foreground px-3.5 py-2.5 transition-all",
              formFieldLabel: "text-xs font-medium text-foreground",
              footerActionLink: "text-foreground font-semibold hover:underline text-xs",
              identityPreviewText: "text-xs font-medium text-foreground",
              dividerLine: "bg-border/60",
              dividerText: "text-xs text-dim bg-surface px-2",
            },
          }}
        />
      </Suspense>
    </div>
  );
}
