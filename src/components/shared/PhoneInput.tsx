"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", onChange, error, className, ...props }, ref) => {
    // Strip default +91 prefix for internal input display if already present
    const rawNumber = value.startsWith("+91") ? value.slice(3) : value;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
      if (onChange) {
        onChange(digits ? `+91${digits}` : "");
      }
    };

    return (
      <div>
        <div className="relative flex rounded-lg shadow-sm">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-slate-50 px-3 text-xs font-semibold text-muted-foreground dark:bg-slate-900">
            +91
          </span>
          <input
            {...props}
            ref={ref}
            type="tel"
            value={rawNumber}
            onChange={handleTextChange}
            placeholder="98765 43210"
            className={cn(
              "block w-full rounded-r-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              className
            )}
          />
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

