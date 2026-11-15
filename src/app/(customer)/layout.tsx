import { ReactNode } from "react";
import { getPortalSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getPortalSession("CUSTOMER");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role="CUSTOMER"
        gymName={session.gymName}
        userName={session.name}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <Topbar
          role="CUSTOMER"
          gymName={session.gymName}
          userName={session.name}
        />
        <main className="portal-main mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          {children}
        </main>
        <BottomNav role="CUSTOMER" />
      </div>
    </div>
  );
}
