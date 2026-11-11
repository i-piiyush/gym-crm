"use client";

import { useState } from "react";
import { PaymentListItem } from "@/types/payment.types";
import { PlanOption } from "@/types/person.types";
import { PaymentsTable } from "./PaymentsTable";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { PressableButton } from "@/components/motion/PressableButton";
import { LuCreditCard, LuPlus, LuReceipt, LuTrendingUp } from "react-icons/lu";

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
      {/* Top action & metrics banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LuCreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Payment Transactions
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                <LuTrendingUp className="h-3 w-3" />
                <span>₹{totalRevenue.toLocaleString("en-IN")} total</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payments.length} completed transactions with sequential GST receipts
            </p>
          </div>
        </div>

        <PressableButton
          onClick={() => setIsRecordOpen(true)}
          className="shrink-0 flex items-center gap-2"
        >
          <LuPlus className="h-4 w-4" />
          <span>Record Payment</span>
        </PressableButton>
      </div>

      {/* Payments Table */}
      <PaymentsTable payments={payments} />

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        customers={customers}
        plans={plans}
        onPaymentSuccess={() => {
          // Window reload or Next.js router refresh happens via server action revalidatePath
        }}
      />
    </div>
  );
}

