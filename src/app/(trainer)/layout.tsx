import { ReactNode } from "react";
import { getPortalSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function TrainerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getPortalSession("TRAINER");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="TRAINER" gymName={session.gymName} />
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        <Topbar role="TRAINER" gymName={session.gymName} userName={session.name} />
        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">{children}</main>
        <BottomNav role="TRAINER" />
      </div>
    </div>
  );
}
