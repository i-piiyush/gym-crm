import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Back to home shortcut */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium text-dim hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to GYM-OS</span>
      </Link>

      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2.5 group mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm transition-transform group-hover:scale-105">
            <span className="font-semibold text-sm tracking-tight text-background">G</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            GYM-OS
          </span>
        </Link>
        <p className="text-xs text-dim">
          Your gym. In perfect sync.
        </p>
      </div>

      <div className="w-full max-w-md">{children}</div>

      <div className="mt-8 text-center text-[11px] text-dim/60">
        © {new Date().getFullYear()} GYM-OS Systems Inc. All rights reserved.
      </div>
    </div>
  );
}
