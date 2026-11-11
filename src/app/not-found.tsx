import Link from "next/link";
import { LuSearch, LuHouse } from "react-icons/lu";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6 shadow-sm">
        <LuSearch className="h-7 w-7" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Page Not Found
      </h1>

      <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
        The page you are looking for does not exist or may have been moved.
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <LuHouse className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

