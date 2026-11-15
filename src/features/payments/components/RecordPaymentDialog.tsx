"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recordPaymentSchema,
  RecordPaymentInput,
} from "@/schemas/payment.schema";
import { recordPaymentAction } from "@/actions/payment.actions";
import { PressableButton } from "@/components/motion/PressableButton";
import { PlanOption } from "@/types/person.types";
import { toast } from "sonner";
import {
  X as LuX,
  CreditCard as LuCreditCard,
  Calendar as LuCalendar,
  Check as LuCheck,
} from "lucide-react";

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  currentPlanName?: string | null;
  membershipEnd?: Date | null;
}

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerOption[];
  plans: PlanOption[];
  onPaymentSuccess?: () => void;
}

export function RecordPaymentDialog({
  isOpen,
  onClose,
  customers,
  plans,
  onPaymentSuccess,
}: RecordPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      customerId: customers[0]?.id || "",
      planId: plans[0]?.id || "",
      emailReceipt: true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const selectedPlanId = watch("planId");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const onSubmit = async (data: RecordPaymentInput) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await recordPaymentAction(data);
      if (res.success) {
        if (res.data.deliveryStatus === "SENT") {
          toast.success(
            `Payment recorded! Receipt #${res.data.receiptNumber} emailed to customer.`,
          );
        } else if (res.data.deliveryStatus === "FAILED") {
          toast.error(
            `Payment recorded (#${res.data.receiptNumber}), but email dispatch failed.`,
            {
              action: {
                label: "View Payment",
                onClick: () => window.location.reload(),
              },
            },
          );
        } else {
          toast.success(
            `Payment recorded successfully! Receipt #${res.data.receiptNumber}`,
          );
        }

        router.refresh();
        reset();
        onClose();
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        toast.error(res.error || "Failed to record payment.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
        onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
      >
        <DialogTitle className="pr-7">Record a payment</DialogTitle>
        <DialogDescription>
          Choose a member and plan. Demo payments update records without
          charging a bank account.
        </DialogDescription>
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 space-y-4"
        >
          {/* Customer Selector */}
          <div>
            <label
              htmlFor="register-customerId"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Select Customer <span className="text-destructive">*</span>
            </label>
            <select
              aria-invalid={!!errors.customerId}
              aria-describedby={
                errors.customerId ? "register-customerId-error" : undefined
              }
              id="register-customerId"
              {...register("customerId")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a member</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p
                id="register-customerId-error"
                role="alert"
                className="mt-1 text-xs text-destructive"
              >
                {errors.customerId.message}
              </p>
            )}
          </div>

          {/* Plan Selector */}
          <div>
            <label
              htmlFor="register-planId"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Membership Plan <span className="text-destructive">*</span>
            </label>
            <select
              aria-invalid={!!errors.planId}
              aria-describedby={
                errors.planId ? "register-planId-error" : undefined
              }
              id="register-planId"
              {...register("planId")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationDays} days) — ₹
                  {p.price.toLocaleString("en-IN")}
                </option>
              ))}
            </select>
            {errors.planId && (
              <p
                id="register-planId-error"
                role="alert"
                className="mt-1 text-xs text-destructive"
              >
                {errors.planId.message}
              </p>
            )}
          </div>

          {/* Plan Summary Card */}
          {selectedPlan && (
            <div className="rounded-xl border border-emerald-200 bg-status-active-bg/60 p-3.5 text-xs text-status-active-fg   ">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount Due</span>
                <span className="text-base font-semibold text-primary">
                  ₹{selectedPlan.price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <LuCalendar className="h-3.5 w-3.5" />
                <span>
                  Extends membership validity by {selectedPlan.durationDays}{" "}
                  days.
                </span>
              </div>
            </div>
          )}

          {/* Email Receipt Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              {...register("emailReceipt")}
              type="checkbox"
              aria-invalid={!!errors.emailReceipt}
              aria-describedby={
                errors.emailReceipt ? "emailReceiptCheck-error" : undefined
              }
              id="emailReceiptCheck"
              defaultChecked={true}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label className="text-xs font-medium text-foreground cursor-pointer">
              Email official PDF receipt to customer
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <PressableButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </PressableButton>
            <PressableButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !selectedPlan}
            >
              {isSubmitting ? (
                "Processing payment…"
              ) : (
                <span className="flex items-center gap-1.5">
                  <LuCheck className="h-4 w-4" />
                  <span>Record demo payment</span>
                </span>
              )}
            </PressableButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
