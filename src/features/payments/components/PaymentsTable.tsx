"use client";

import { useState } from "react";
import { PaymentListItem } from "@/types/payment.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { resendReceiptEmailAction, getReceiptDownloadUrlAction } from "@/actions/payment.actions";
import { toast } from "sonner";
import {
  Search,
  Download,
  Mail,
  Loader2,
  Receipt,
  AlertCircle,
  FileText,
} from "lucide-react";
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
      {/* Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858585]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, customer, or plan..."
            className="w-full rounded-full border border-[rgba(40,40,40,0.08)] bg-white pl-9 pr-4 py-1.5 text-xs text-[#242424] placeholder:text-[#858585] focus:border-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>
        <span className="text-xs text-[#71697a]">
          Showing {filtered.length} of {payments.length} transactions
        </span>
      </div>

      {/* Stripe/Apple Style Table */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
              <tr>
                <th className="px-5 py-3.5">Receipt #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#71697a]">
                    {search ? "No payments match your search." : "No payment records logged yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const initials = p.customerName
                    ? p.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "C";

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Receipt ID */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] font-semibold text-[#242424] bg-stone-100 px-2 py-0.5 rounded border border-[rgba(40,40,40,0.04)]">
                          {p.receiptNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f6d0] text-xs font-semibold text-[#242424]">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#242424]">{p.customerName}</p>
                            <p className="text-[11px] text-[#71697a]">{p.customerEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3.5 font-medium text-[#242424]">
                        {p.planName}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#242424] tabular-nums">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#71697a]">
                        {p.paidAt ? format(new Date(p.paidAt), "dd MMM yyyy, hh:mm a") : "—"}
                      </td>

                      {/* Delivery Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={p.deliveryStatus}
                          label={
                            p.deliveryStatus === "SENT"
                              ? "Email Delivered"
                              : p.deliveryStatus === "FAILED"
                              ? "Delivery Failed"
                              : "Delivery Pending"
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download PDF */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(p.id)}
                            disabled={downloadingId === p.id}
                            className="apple-button-press inline-flex h-7 items-center gap-1 rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-2.5 text-[11px] font-medium text-[#242424] hover:bg-stone-50"
                            title="Download Signed PDF Receipt"
                          >
                            {downloadingId === p.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3 text-[#71697a]" />
                            )}
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          {/* Resend Email */}
                          <button
                            type="button"
                            onClick={() => handleResendEmail(p)}
                            disabled={resendingId === p.id}
                            className="apple-button-press inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#71697a] hover:bg-stone-100"
                            title="Resend Receipt Email"
                          >
                            {resendingId === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Mail className="h-3.5 w-3.5" />
                            )}
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
