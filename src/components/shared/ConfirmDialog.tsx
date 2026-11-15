"use client";
import { AlertDialog } from "radix-ui";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  children?: React.ReactNode;
}
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onCancel()}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/25 backdrop-blur-sm" />
        <AlertDialog.Content className="dialog-content fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-7 shadow-xl">
          <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-desert/30">
            <AlertTriangle className="size-5 text-status-warning-fg" />
          </span>
          <AlertDialog.Title className="text-lg font-semibold tracking-tight">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </AlertDialog.Description>
          {children && <div className="mt-4">{children}</div>}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={isLoading} onClick={onCancel}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              disabled={isLoading}
              onClick={onConfirm}
            >
              {isLoading && <Loader2 className="animate-spin" />}
              {isLoading ? "Processing…" : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
