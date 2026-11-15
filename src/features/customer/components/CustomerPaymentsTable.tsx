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

import { useState } from "react";
import { format } from "date-fns";
import { getReceiptDownloadUrlAction } from "@/actions/payment.actions";
import { toast } from "sonner";
import {
  Download as LuDownload,
  Loader as LuLoader,
  Receipt as LuReceipt,
  Search as LuSearch,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface PaymentItem {
  id: string;
  receiptNumber: string;
  amount: unknown;
  paidAt: Date;
  status: string;
  plan: {
    name: string;
    durationDays: number;
  } | null;
  gym: {
    name: string;
  };
}

interface CustomerPaymentsTableProps {
  payments: PaymentItem[];
}

export function CustomerPaymentsTable({
  payments,
}: CustomerPaymentsTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.receiptNumber.toLowerCase().includes(q) ||
      (p.plan?.name || "").toLowerCase().includes(q)
    );
  });

  const handleDownload = async (paymentId: string) => {
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
      toast.error("Failed to download receipt.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipts by number or plan..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {payments.length} receipts
        </span>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-sm">
            <TableHeader className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground ">
              <TableRow>
                <TableHead className="px-6 py-4">Receipt #</TableHead>
                <TableHead className="px-6 py-4">Membership Plan</TableHead>
                <TableHead className="px-6 py-4">Amount Paid</TableHead>
                <TableHead className="px-6 py-4">Payment Date</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4 text-right">
                  PDF Invoice
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground text-xs"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LuReceipt className="h-8 w-8 text-muted-foreground/40" />
                      <p>
                        {search
                          ? "No receipts match your search."
                          : "No payment receipts found."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const isDownloading = downloadingId === p.id;

                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/30  transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {p.receiptNumber}
                        </span>
                        <div className="text-[11px] text-muted-foreground">
                          {p.gym.name}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="font-semibold text-xs text-foreground">
                          {p.plan?.name || "Membership Plan"}
                        </div>
                        {p.plan && (
                          <div className="text-[11px] text-muted-foreground">
                            {p.plan.durationDays} days validity
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          ₹{Number(p.amount).toLocaleString("en-IN")}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">
                          {format(new Date(p.paidAt), "dd MMM yyyy")}
                        </div>
                        <div className="text-[11px]">
                          {format(new Date(p.paidAt), "hh:mm a")}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <StatusBadge status={p.status} label={p.status} />
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          onClick={() => handleDownload(p.id)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted  disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {isDownloading ? (
                            <LuLoader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <LuDownload className="h-3.5 w-3.5 text-primary" />
                          )}
                          <span>Download PDF</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
