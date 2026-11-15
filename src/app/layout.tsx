import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "GYM-OS — Your gym. In perfect sync.",
  description: "The premium operating system for modern gyms. Manage members, track attendance, handle billing, and monitor performance in one beautifully simple workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 3500,
              className: "font-sans text-sm rounded-lg border-border shadow-md",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
