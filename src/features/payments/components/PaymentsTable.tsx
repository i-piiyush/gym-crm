"use client";

import { useState } from "react";
import { PaymentListItem } from "@/types/payment.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { resendReceiptEmailAction, getReceiptDownloadUrlAction } from "@/actions/payment.actions";
import { toast } from "sonner";
import {
  LuSearch,
  LuDownload,
  LuMail,
  LuLoader,
  LuReceipt,
  LuCircleAlert,
} from "react-icons/lu";
import { format } from "date-fns";

interface PaymentsTableProps {
  payments: PaymentListItem[];
}

export function PaymentsTable({ payments: initialPayments }: PaymentsTableProps) {
  const [payments, setPayments] = useState<PaymentListItem[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.receiptNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerEmail.toLowerCase().includes(q) ||
      p.planName.toLowerCase().includes(q)
    );
  });

  const handleDownloadPdf = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      const res = await getReceiptDownloadUrlAction({ paymentId });
      if (!res.success) {
        toast.error(res.error || "Failed to generate receipt PDF.");
        return;
      }
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
      }
    } catch {
      toast.error("Could not download receipt PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResendEmail = async (payment: PaymentListItem) => {
    setResendingId(payment.id);
    try {
      const res = await resendReceiptEmailAction({ paymentId: payment.id });
      if (!res.success) {
        toast.error(res.error || "Failed to resend receipt email.");
        return;
      }

      if (res.data.deliveryStatus === "SENT") {
        toast.success(`Receipt email successfully delivered to ${payment.customerEmail}`);
        setPayments((prev) =>
          prev.map((item) =>
            item.id === payment.id
              ? { ...item, deliveryStatus: "SENT", deliveryError: null }
              : item
          )
        );
      } else {
        toast.error(res.data.errorMessage || "Email delivery failed.");
        setPayments((prev) =>
          prev.map((item) =>
            item.id === payment.id
              ? {
                  ...item,
                  deliveryStatus: "FAILED",
                  deliveryError: res.data.errorMessage || "Delivery failed",
                }
              : item
          )
        );
      }
    } catch {
      toast.error("An error occurred while resending the receipt email.");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, customer, email, plan..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {payments.length} transactions
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Receipt #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan & Amount</th>
                <th className="px-6 py-4">Paid Date</th>
                <th className="px-6 py-4">Email Delivery</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LuReceipt className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm">
                        {search ? "No payments match your search." : "No payment records found."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isResending = resendingId === p.id;
                  const isDownloading = downloadingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {p.receiptNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground uppercase font-mono">
                          {p.provider}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{p.customerName}</div>
                        <div className="text-xs text-muted-foreground">{p.customerEmail}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-xs text-foreground">{p.planName}</div>
                        <div className="font-mono text-sm font-bold text-foreground mt-0.5">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-foreground">
                          {format(new Date(p.paidAt), "dd MMM yyyy")}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {format(new Date(p.paidAt), "hh:mm a")}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={p.deliveryStatus} label={p.deliveryStatus} />
                          {p.deliveryError && (
                            <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                              <LuCircleAlert className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[150px]" title={p.deliveryError}>
                                {p.deliveryError}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPdf(p.id)}
                            disabled={isDownloading}
                            title="Download PDF Receipt"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            {isDownloading ? (
                              <LuLoader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <LuDownload className="h-3.5 w-3.5 text-primary" />
                            )}
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => handleResendEmail(p)}
                            disabled={isResending}
                            title="Resend receipt email"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            {isResending ? (
                              <LuLoader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <LuMail className="h-3.5 w-3.5 text-primary" />
                            )}
                            <span>Resend</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

