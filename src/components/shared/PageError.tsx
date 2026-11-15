"use client";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PageError({ reset }: { reset: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center"
    >
      <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-desert/30">
        <AlertCircle className="size-5 text-status-warning-fg" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        We couldn’t load this page.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-dim">
        Please try again in a moment. If the issue continues, contact your gym
        administrator.
      </p>
      <Button onClick={reset} className="mt-6">
        <RefreshCw />
        Try again
      </Button>
    </div>
  );
}
