"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PressableButton } from "@/components/motion/PressableButton";
import { LuTriangleAlert } from "react-icons/lu";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  variant === "destructive"
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                    : "bg-emerald-50 text-primary dark:bg-emerald-950/50"
                }`}
              >
                <LuTriangleAlert className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
                {children && <div className="mt-4">{children}</div>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <PressableButton
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </PressableButton>
              <PressableButton
                variant={variant}
                size="sm"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : confirmLabel}
              </PressableButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
