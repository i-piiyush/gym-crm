import { ReactNode } from "react";
import { getPortalSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getPortalSession("SUPER_ADMIN");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="SUPER_ADMIN" gymName="Platform Admin" />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <Topbar
          role="SUPER_ADMIN"
          gymName="Super Admin Platform"
          userName={session.name}
        />
        <main className="portal-main mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          {children}
        </main>
        <BottomNav role="SUPER_ADMIN" />
      </div>
    </div>
  );
}
