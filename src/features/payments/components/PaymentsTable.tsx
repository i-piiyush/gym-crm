"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { PaymentListItem } from "@/types/payment.types";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  resendReceiptEmailAction,
  getReceiptDownloadUrlAction,
} from "@/actions/payment.actions";
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

export function PaymentsTable({
  payments: initialPayments,
}: PaymentsTableProps) {
  const [payments, setPayments] = useState<PaymentListItem[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      (status === "ALL" || p.status === status) &&
      (p.receiptNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q))
    );
  });

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10)),
  );
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);

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
        toast.success(
          `Receipt email successfully delivered to ${payment.customerEmail}`,
        );
        setPayments((prev) =>
          prev.map((item) =>
            item.id === payment.id
              ? { ...item, deliveryStatus: "SENT", deliveryError: null }
              : item,
          ),
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
              : item,
          ),
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
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by receipt #, customer, or plan..."
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>
        <select
          aria-label="Filter payment status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-card px-3 text-xs"
        >
          <option value="ALL">All statuses</option>
          {["PAID", "PENDING", "FAILED", "REFUNDED"].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {payments.length} transactions
        </span>
      </div>

      {/* Stripe/Apple Style Table */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
              <TableRow>
                <TableHead className="px-5 py-3.5">Receipt #</TableHead>
                <TableHead className="px-5 py-3.5">Customer</TableHead>
                <TableHead className="px-5 py-3.5">Plan</TableHead>
                <TableHead className="px-5 py-3.5">Amount</TableHead>
                <TableHead className="px-5 py-3.5">Date</TableHead>
                <TableHead className="px-5 py-3.5">Payment status</TableHead>
                <TableHead className="px-5 py-3.5">Receipt delivery</TableHead>
                <TableHead className="px-5 py-3.5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {search
                      ? "No payments match your search."
                      : "No payment records logged yet."}
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((p) => {
                  const initials = p.customerName
                    ? p.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "C";

                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {/* Receipt ID */}
                      <TableCell className="px-5 py-3.5">
                        <span className="font-mono text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          {p.receiptNumber}
                        </span>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-semibold text-foreground">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {p.customerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {p.customerEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Plan */}
                      <TableCell className="px-5 py-3.5 font-medium text-foreground">
                        {p.planName}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground tabular-nums">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {p.paidAt
                          ? format(new Date(p.paidAt), "dd MMM yyyy, hh:mm a")
                          : "—"}
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                        <p className="mt-1 text-[10px] text-dim">
                          {p.provider === "DEMO" ? "Demo payment" : "Razorpay"}
                        </p>
                      </TableCell>
                      {/* Delivery Status */}
                      <TableCell className="px-5 py-3.5">
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
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download PDF */}
                          <Button
                            type="button"
                            onClick={() => handleDownloadPdf(p.id)}
                            disabled={downloadingId === p.id}
                            className="apple-button-press inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-[11px] font-medium text-foreground hover:bg-muted"
                            title="Download Signed PDF Receipt"
                          >
                            {downloadingId === p.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="hidden sm:inline">PDF</span>
                          </Button>

                          {/* Resend Email */}
                          <Button
                            type="button"
                            onClick={() => handleResendEmail(p)}
                            disabled={resendingId === p.id}
                            className="apple-button-press inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                            title="Resend Receipt Email"
                          >
                            {resendingId === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Mail className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          page={currentPage}
          total={filtered.length}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
