"use client";

import { motion, useReducedMotion } from "motion/react";

interface CountdownRingProps {
  totalSeconds: number;
  secondsRemaining: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CountdownRing({
  totalSeconds,
  secondsRemaining,
  size = 48,
  strokeWidth = 4,
  className,
}: CountdownRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsRemaining / totalSeconds));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className || ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          style={{
            strokeDasharray: circumference,
          }}
          animate={{
            strokeDashoffset: shouldReduceMotion ? 0 : strokeDashoffset,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
            ease: "linear",
          }}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums text-foreground">
        {Math.ceil(secondsRemaining)}s
      </span>
    </div>
  );
}

