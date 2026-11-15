"use client";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Command } from "cmdk";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  QrCode,
  ArrowRight,
  Loader2,
  Users,
} from "lucide-react";
import { UserRoleType } from "@/constants/roles";
import { ROLE_NAVIGATION } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { NavigationItems } from "./Sidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
export function Topbar({
  role,
  gymName,
  userName,
}: {
  role: UserRoleType;
  gymName?: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const navigation = ROLE_NAVIGATION[role];
  const current = [...navigation]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  useEffect(() => {
    setMobile(false);
    setSearchOpen(false);
  }, [pathname]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!searchOpen || role !== "ADMIN" || query.trim().length < 2) {
      setMembers([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    setSearchError("");
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search is temporarily unavailable.");
        setMembers((await response.json()).members);
      } catch (e) {
        if (!controller.signal.aborted)
          setSearchError(e instanceof Error ? e.message : "Search failed.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, role, searchOpen]);
  const go = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };
  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-lg sm:px-7 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden truncate text-dim sm:inline">
              {gymName || "Workspace"}
            </span>
            <ChevronRight className="hidden size-3 text-dim/50 sm:block" />
            <span className="truncate font-medium">
              {current?.title || "Workspace"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            aria-label="Search workspace"
            className="border-0 bg-transparent text-dim sm:w-52 sm:justify-start"
          >
            <Search />
            <span className="hidden flex-1 text-left text-xs sm:inline">
              Search anything…
            </span>
            <kbd className="hidden rounded border border-border px-1 text-[10px] sm:inline">
              ⌘ K
            </kbd>
          </Button>
          {role !== "SUPER_ADMIN" && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={
                role === "ADMIN" ? "Open check-in station" : "Check in"
              }
            >
              <Link
                href={role === "ADMIN" ? "/admin/attendance/qr" : "/checkin"}
              >
                <QrCode />
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="View notifications"
              >
                <Bell />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-5">
              <p className="text-sm font-semibold">Your gym’s updates</p>
              <p className="mt-2 text-xs leading-relaxed text-dim">
                {role === "ADMIN"
                  ? "Upcoming renewals and payment reminders are available on your overview."
                  : "Your attendance and account activity are available in your workspace."}
              </p>
              <Link
                href={navigation[0]?.href || "/"}
                className="mt-4 flex items-center gap-2 text-xs font-medium"
              >
                Open overview <ArrowRight className="size-3" />
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-1 border-l border-border pl-4">
            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
          </div>
        </div>
      </header>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="max-w-[300px] bg-muted">
          <SheetTitle className="pr-10 text-lg font-semibold">
            GYM-OS
          </SheetTitle>
          <SheetDescription className="mb-8 mt-2 text-xs text-dim">
            {gymName} · {userName}
          </SheetDescription>
          <NavigationItems role={role} onNavigate={() => setMobile(false)} />
          <Link href="/help" className="mt-8 text-sm text-dim">
            Help & support
          </Link>
        </SheetContent>
      </Sheet>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 sm:p-0">
          <DialogTitle className="sr-only">Search your workspace</DialogTitle>
          <DialogDescription className="sr-only">
            Find members or navigate to a page. Use arrow keys to select a
            result.
          </DialogDescription>
          <Command shouldFilter={false} className="rounded-2xl">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 pr-12">
              <Search className="size-4 text-dim" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search members or pages…"
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-sm text-dim">
                No matching results.
              </Command.Empty>
              {searching && (
                <p className="flex items-center gap-2 px-3 py-3 text-xs text-dim">
                  <Loader2 className="size-3 animate-spin" />
                  Searching members…
                </p>
              )}
              {searchError && (
                <p role="alert" className="px-3 py-3 text-xs text-destructive">
                  {searchError}
                </p>
              )}
              {members.length > 0 && (
                <Command.Group
                  heading="Members"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-dim"
                >
                  {members.map((m) => (
                    <Command.Item
                      key={m.id}
                      value={m.id}
                      onSelect={() => go(`/admin/people/${m.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm data-[selected=true]:bg-muted"
                    >
                      <Users className="size-4 text-dim" />
                      <div>
                        <p>{m.name}</p>
                        <p className="mt-0.5 text-xs text-dim">{m.email}</p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              <Command.Group
                heading="Pages"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-dim"
              >
                {navigation
                  .filter((n) =>
                    n.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((n) => (
                    <Command.Item
                      key={n.href}
                      value={n.href}
                      onSelect={() => go(n.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm data-[selected=true]:bg-muted"
                    >
                      <n.icon className="size-4 text-dim" />
                      {n.title}
                      <ArrowRight className="ml-auto size-3 text-dim" />
                    </Command.Item>
                  ))}
              </Command.Group>
            </Command.List>
            <div className="border-t border-border px-5 py-3 text-[11px] text-dim">
              ↑ ↓ to navigate · Enter to open · Esc to close
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
