import { redirect } from "next/navigation";
// Existing invitation emails can still point here; public account creation is removed.
export default async function SignUpRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const ticket = params.__clerk_ticket;
  if (typeof ticket === "string" && ticket) {
    redirect(`/accept-invitation?__clerk_ticket=${encodeURIComponent(ticket)}`);
  }
  redirect("/sign-in");
}
