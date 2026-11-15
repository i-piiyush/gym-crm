import { Brand } from "./Brand";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export function InfoPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-[76px] max-w-4xl items-center justify-between px-6">
          <Brand />
          <Link
            href="/?preview=true"
            className="flex items-center gap-2 text-xs text-dim"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-[-1.2px]">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-dim">{description}</p>
        <div className="mt-10 space-y-8 text-sm leading-[1.8] text-dim [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:text-foreground [&_a]:underline">
          {children}
        </div>
      </main>
      <footer className="mx-auto flex max-w-3xl flex-wrap gap-5 border-t border-border px-6 py-7 text-xs text-dim">
        <Link href="/help">Help</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
