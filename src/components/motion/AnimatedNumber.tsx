"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-IN"),
  className,
}: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    damping: 30,
    stiffness: 200,
  });

  const displayVal = useTransform(springVal, (current) => format(current));

  useEffect(() => {
    if (shouldReduceMotion) {
      if (ref.current) {
        ref.current.textContent = format(value);
      }
      return;
    }
    motionVal.set(value);
  }, [value, motionVal, shouldReduceMotion, format]);

  if (shouldReduceMotion) {
    return <span className={className}>{format(value)}</span>;
  }

  return (
    <motion.span ref={ref} className={className}>
      {displayVal}
    </motion.span>
  );
}

