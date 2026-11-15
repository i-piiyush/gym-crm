"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Brand } from "@/components/shared/Brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-[13px] text-dim md:flex"
        >
          <a className="hover:text-foreground" href="#features">
            Features
          </a>
          <a className="hover:text-foreground" href="#solutions">
            Solutions
          </a>
          <a className="hover:text-foreground" href="#about">
            About
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/sign-in">Log in</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-xs">
          <SheetTitle className="mt-4 text-lg font-semibold">GYM-OS</SheetTitle>
          <SheetDescription className="mt-1 text-sm text-dim">
            Your gym. In perfect sync.
          </SheetDescription>
          <nav className="mt-8 flex flex-col gap-6">
            {["features", "solutions", "about"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="capitalize"
              >
                {id}
              </a>
            ))}
            <Link href="/sign-in">Log in</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
