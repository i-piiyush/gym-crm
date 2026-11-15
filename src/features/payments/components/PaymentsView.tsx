"use client";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { PaymentListItem } from "@/types/payment.types";
import { PlanOption } from "@/types/person.types";
import { PaymentsTable } from "./PaymentsTable";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import {
  CreditCard,
  Plus,
  TrendingUp,
  Receipt,
  ShieldCheck,
} from "lucide-react";

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  currentPlanName?: string | null;
  membershipEnd?: Date | null;
}

interface PaymentsViewProps {
  payments: PaymentListItem[];
  customers: CustomerOption[];
  plans: PlanOption[];
}

export function PaymentsView({
  payments,
  customers,
  plans,
}: PaymentsViewProps) {
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* TOP REVENUE & METRICS CARD */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Payments at a glance
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-honeydew/50 px-2.5 py-0.5 text-xs font-semibold text-status-active-fg font-mono tabular-nums">
                ₹{totalRevenue.toLocaleString("en-IN")} Collected
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {payments.length} recorded transactions. Receipts, right where you
              need them.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsRecordOpen(true)}
          className="apple-button-press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/85"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Payment</span>
        </Button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAYMENTS DATA TABLE */}
      {/* -------------------------------------------------------------------- */}
      <PaymentsTable payments={payments} />

      {/* -------------------------------------------------------------------- */}
      {/* RECORD PAYMENT DIALOG */}
      {/* -------------------------------------------------------------------- */}
      {isRecordOpen && (
        <RecordPaymentDialog
          isOpen={isRecordOpen}
          onClose={() => setIsRecordOpen(false)}
          customers={customers}
          plans={plans}
          onPaymentSuccess={() => {
            // Server actions revalidate the path automatically
          }}
        />
      )}
    </div>
  );
}
