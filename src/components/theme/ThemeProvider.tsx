"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { getAuthAppearance } from "@/config/auth-appearance";

export type Theme = "system" | "light" | "dark";
const STORAGE_KEY = "gym-os-theme";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, updateTheme] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const read = (): Theme => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "light" || saved === "dark" ? saved : "system";
      } catch { return "system"; }
    };
    const apply = () => {
      const preference = read();
      const mode = preference === "system" ? (media.matches ? "dark" : "light") : preference;
      document.documentElement.classList.toggle("dark", mode === "dark");
      document.documentElement.style.colorScheme = mode;
      updateTheme(preference);
      setResolved(mode);
    };
    apply();
    media.addEventListener("change", apply);
    window.addEventListener("storage", apply);
    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);
  const setTheme = (preference: Theme) => {
    const mode = preference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    try { localStorage.setItem(STORAGE_KEY, preference); } catch {}
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.style.colorScheme = mode;
    updateTheme(preference);
    setResolved(mode);
  };
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ClerkProvider appearance={getAuthAppearance(resolved)} localization={{ signIn: { start: { title: "Sign in to GYM-OS", subtitle: "Welcome back. Sign in to your gym workspace." } } }}>
        {children}
        <Toaster theme={resolved} position="bottom-right" closeButton toastOptions={{
          duration: 3500,
          className: "font-sans text-sm rounded-lg border-border shadow-md",
        }} />
      </ClerkProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

