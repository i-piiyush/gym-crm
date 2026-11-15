import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { PageLoader } from "@/components/shared/PageLoader";
export const dynamic = "force-dynamic";
export default function SignInPage() {
  return <Suspense fallback={<PageLoader label="Loading secure sign in…" className="min-h-64" />}><LoginForm /></Suspense>;
}
