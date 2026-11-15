"use client";

import { useState } from "react";
import { PaymentListItem } from "@/types/payment.types";
import { PlanOption } from "@/types/person.types";
import { PaymentsTable } from "./PaymentsTable";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { CreditCard, Plus, TrendingUp, Receipt, ShieldCheck } from "lucide-react";

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

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* TOP REVENUE & METRICS CARD */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#242424] text-white shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#242424]">
                Financial Ledger & Billing
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d0e1d4]/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 font-mono tabular-nums">
                ₹{totalRevenue.toLocaleString("en-IN")} Collected
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#71697a]">
              {payments.length} completed transactions with atomic sequential receipts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsRecordOpen(true)}
          className="apple-button-press inline-flex items-center justify-center gap-2 rounded-full bg-[#242424] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Payment</span>
        </button>
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
