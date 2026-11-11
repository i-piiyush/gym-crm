"use client";

import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PressableButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function PressableButton({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: PressableButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-emerald-700 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-slate-200",
    outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
    ghost: "bg-transparent hover:bg-secondary text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-rose-700 shadow-sm",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-6 text-base rounded-lg",
  };

  return (
    <motion.button
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

