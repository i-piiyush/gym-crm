"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recordPaymentSchema, RecordPaymentInput } from "@/schemas/payment.schema";
import { recordPaymentAction } from "@/actions/payment.actions";
import { PressableButton } from "@/components/motion/PressableButton";
import { PlanOption } from "@/types/person.types";
import { toast } from "sonner";
import { LuX, LuCreditCard, LuCalendar, LuCheck } from "react-icons/lu";

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
    setIsSubmitting(true);
    try {
      const res = await recordPaymentAction(data);
      if (res.success) {
        if (res.data.deliveryStatus === "SENT") {
          toast.success(`Payment recorded! Receipt #${res.data.receiptNumber} emailed to customer.`);
        } else if (res.data.deliveryStatus === "FAILED") {
          toast.error(`Payment recorded (#${res.data.receiptNumber}), but email dispatch failed.`, {
            action: {
              label: "View Payment",
              onClick: () => window.location.reload(),
            },
          });
        } else {
          toast.success(`Payment recorded successfully! Receipt #${res.data.receiptNumber}`);
        }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-primary dark:bg-emerald-950/40">
              <LuCreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Record Membership Payment</h2>
              <p className="text-xs text-muted-foreground">Process payment &amp; issue sequential receipt.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* Customer Selector */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Select Customer <span className="text-destructive">*</span>
            </label>
            <select
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
              <p className="mt-1 text-xs text-destructive">{errors.customerId.message}</p>
            )}
          </div>

          {/* Plan Selector */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Membership Plan <span className="text-destructive">*</span>
            </label>
            <select
              {...register("planId")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationDays} days) — ₹{p.price.toLocaleString("en-IN")}
                </option>
              ))}
            </select>
            {errors.planId && (
              <p className="mt-1 text-xs text-destructive">{errors.planId.message}</p>
            )}
          </div>

          {/* Plan Summary Card */}
          {selectedPlan && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount Due</span>
                <span className="text-base font-bold text-primary">
                  ₹{selectedPlan.price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <LuCalendar className="h-3.5 w-3.5" />
                <span>Extends membership validity by {selectedPlan.durationDays} days.</span>
              </div>
            </div>
          )}

          {/* Email Receipt Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              {...register("emailReceipt")}
              type="checkbox"
              id="emailReceiptCheck"
              defaultChecked={true}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label
              htmlFor="emailReceiptCheck"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
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
                "Processing..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <LuCheck className="h-4 w-4" />
                  <span>Pay (Demo)</span>
                </span>
              )}
            </PressableButton>
          </div>
        </form>
      </div>
    </div>
  );
}

