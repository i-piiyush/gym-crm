"use client";
import { MotionConfig as Provider } from "motion/react";
export function MotionConfig({ children }: { children: React.ReactNode }) {
  return <Provider reducedMotion="user">{children}</Provider>;
}
