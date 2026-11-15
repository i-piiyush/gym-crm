"use client";

import { Monitor, Moon, Sun, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "./ThemeProvider";

const options = [
  { value: "system", label: "Device theme", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = options.find((option) => option.value === theme)?.icon || Monitor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Choose theme" title="Choose theme">
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Theme">
        {options.map(({ value, label, icon: OptionIcon }) => (
          <DropdownMenuItem key={value} onSelect={() => setTheme(value as Theme)}>
            <OptionIcon /> {label}
            {theme === value && <Check className="ml-auto" aria-label="Selected" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
