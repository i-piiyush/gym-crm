import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotInvitedPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium text-dim hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to GYM-OS</span>
      </Link>

      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2.5 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
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

      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-desert/25 text-foreground mb-4">
          <ShieldAlert className="h-6 w-6 text-[#8F5A38]" />
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          No Facility Invitation Found
        </h2>

        <p className="mt-2 text-xs text-dim leading-relaxed">
          The email <span className="font-semibold text-foreground">{email || "you signed in with"}</span> has not been enrolled or invited by any gym administrator.
        </p>

        <div className="mt-5 rounded-xl bg-[#F5F5F3]/70 p-4 text-xs text-dim text-left border border-border/60">
          <p className="font-medium text-foreground mb-1.5">Next Steps:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Contact your gym reception or manager to add your profile.</li>
            <li>If you registered under a different email, switch accounts below.</li>
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2.5 pt-4 border-t border-border/40">
          <UserButton />
          <span className="text-xs font-medium text-dim">Switch Account or Sign Out</span>
        </div>
      </div>
    </div>
  );
}
