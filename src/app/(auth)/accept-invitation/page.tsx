import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InvitationForm } from "@/features/auth/components/InvitationForm";
import { PageLoader } from "@/components/shared/PageLoader";

export const dynamic = "force-dynamic";
export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  if (typeof params.__clerk_ticket !== "string" || !params.__clerk_ticket) redirect("/sign-in");
  return <Suspense fallback={<PageLoader label="Loading your invitation…" className="min-h-64" />}><InvitationForm /></Suspense>;
}
