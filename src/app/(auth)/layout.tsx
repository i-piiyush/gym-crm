import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { MemberPreview } from "@/features/marketing/components/ProductPreview";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-card lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 lg:flex xl:p-16">
        <Brand />
        <div className="my-12 max-w-lg">
          <p className="text-xs text-dim">YOUR GYM. IN PERFECT SYNC.</p>
          <h1 className="mt-5 text-[48px] font-semibold leading-[1.1] tracking-[-2px]">
            A little less admin.
            <br />
            <span className="text-muted-foreground">A lot more possibility.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-[1.8] text-dim">
            One thoughtful workspace for the people, payments, and everyday
            moments that make your gym.
          </p>
          <div className="mt-9">
            <MemberPreview small />
          </div>
          <p className="mt-3 text-[10px] text-dim">
            Illustrative product preview
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-dim">
          <Check className="size-3.5" />
          Built for the way your gym works.
        </p>
      </aside>
      <main className="relative flex flex-col items-center justify-center px-5 py-24 sm:px-10">
        <div className="absolute right-6 top-5"><ThemeToggle /></div>
        <Link
          href="/?preview=true"
          className="absolute left-6 top-7 flex items-center gap-2 text-xs text-dim hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <div className="mb-8 lg:hidden">
          <Brand />
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
        <p className="mt-7 max-w-sm text-center text-[11px] leading-relaxed text-dim">
          GYM-OS workspaces are invitation-based. Use the email your gym
          invited.
        </p>
        <div className="mt-6 flex gap-5 text-[11px] text-dim">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/help">Need a hand?</Link>
        </div>
      </main>
    </div>
  );
}
