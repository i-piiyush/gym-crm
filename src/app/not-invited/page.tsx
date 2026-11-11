import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { LuShieldAlert, LuDumbbell } from "react-icons/lu";

export const dynamic = "force-dynamic";

export default async function NotInvitedPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <LuDumbbell className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Gym CRM
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-4">
          <LuShieldAlert className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold text-foreground">
          No Active Gym Membership Found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The email <span className="font-semibold text-foreground">{email || "you signed in with"}</span> has not been invited by any gym owner or platform administrator yet.
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-muted-foreground text-left dark:bg-slate-900 border border-border">
          <p className="font-semibold text-foreground mb-1">What should I do?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Contact your gym administrator to send an invitation to this email address.</li>
            <li>If you were invited using a different email address, sign out and sign in with that email.</li>
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <UserButton />
          <span className="text-xs text-muted-foreground">Switch Account</span>
        </div>
      </div>
    </div>
  );
}
