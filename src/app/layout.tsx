import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeInitScript } from "@/lib/theme";
import "@/styles/globals.css";
import { MotionConfig } from "@/components/motion/MotionProvider";

export const metadata: Metadata = {
  title: "GYM-OS — Your gym. In perfect sync.",
  description:
    "The premium operating system for modern gyms. Manage members, track attendance, handle billing, and monitor performance in one beautifully simple workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className="h-full" suppressHydrationWarning>
        <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
        <body
          className="min-h-screen bg-background font-sans antialiased"
          suppressHydrationWarning
        >
          <ThemeProvider><MotionConfig>{children}</MotionConfig></ThemeProvider>
        </body>
      </html>
  );
}
