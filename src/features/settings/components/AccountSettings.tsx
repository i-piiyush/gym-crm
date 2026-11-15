"use client";
import { useClerk } from "@clerk/nextjs";
import { UserRound, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function AccountSettings({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const { openUserProfile } = useClerk();
  return (
    <section className="apple-card flex flex-wrap items-center justify-between gap-5 p-6">
      <div className="flex items-center gap-4">
        <span className="flex size-11 items-center justify-center rounded-full bg-honeydew/50">
          <UserRound className="size-5 text-status-active-fg" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Your account</h2>
          <p className="mt-1 text-sm text-dim">
            {name} · {email}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => openUserProfile()}>
        Manage profile
        <ArrowUpRight />
      </Button>
    </section>
  );
}
