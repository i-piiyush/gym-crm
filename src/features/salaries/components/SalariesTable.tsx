"use client";

import { useState } from "react";
import { SalaryRecordItem, SalaryOverview } from "@/types/salary.types";
import { markSalaryPaidAction } from "@/actions/salary.actions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Calendar,
  Check,
  Loader2,
  Search,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface SalariesTableProps {
  initialOverview: SalaryOverview;
  currentMonth: string;
}

export function SalariesTable({
  initialOverview,
  currentMonth,
}: SalariesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<SalaryOverview>(initialOverview);
  const [search, setSearch] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);

  const selectedMonth = searchParams.get("month") || currentMonth;

  const filteredRecords = overview.records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.trainerName.toLowerCase().includes(q) ||
      r.trainerEmail.toLowerCase().includes(q)
    );
  });

  const handleMonthChange = (newMonth: string) => {
    router.push(`/admin/salaries?month=${newMonth}`);
  };

  const handleMarkPaid = async (record: SalaryRecordItem) => {
    setMarkingId(record.id);
    try {
      const res = await markSalaryPaidAction({ salaryRecordId: record.id });
      if (!res.success) {
        toast.error(res.error || "Failed to mark salary as paid.");
        return;
      }

      toast.success(`Disbursed salary of ₹${record.amount.toLocaleString("en-IN")} to ${record.trainerName}`);
      setOverview((prev) => ({
        ...prev,
        totalPaid: prev.totalPaid + record.amount,
        totalPending: Math.max(0, prev.totalPending - record.amount),
        records: prev.records.map((r) =>
          r.id === record.id
            ? { ...r, status: "PAID", paidAt: new Date() }
            : r
        ),
      }));
    } catch {
      toast.error("An error occurred while updating salary status.");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* 3 PAYROLL METRIC CARDS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Payroll */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#71697a]">
              Total Payroll ({overview.month})
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-[#242424]">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-[#242424] tabular-nums">
            ₹{overview.totalSalaries.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-[#71697a]">
            {overview.records.length} trainers on coaching roster
          </span>
        </div>

        {/* Paid Disbursed */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#71697a]">
              Paid Disbursed
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d0e1d4]/60 text-emerald-900">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-[#242424] tabular-nums">
            ₹{overview.totalPaid.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-800 font-medium">
            Disbursed and recorded
          </span>
        </div>

        {/* Pending Disbursement */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#71697a]">
              Pending Disbursement
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e4be9e]/50 text-[#8c5222]">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-[#242424] tabular-nums">
            ₹{overview.totalPending.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-[#8c5222] font-medium">
            {overview.records.filter((r) => r.status === "PENDING").length} pending payments
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* FILTER & MONTH SELECTOR TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858585]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trainer name or email..."
            className="w-full rounded-full border border-[rgba(40,40,40,0.08)] bg-white pl-9 pr-4 py-1.5 text-xs text-[#242424] placeholder:text-[#858585] focus:border-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#71697a]">
            Payroll Month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-3 py-1.5 text-xs text-[#242424] focus:border-[#242424] focus:outline-none"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SALARIES DATA TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
              <tr>
                <th className="px-5 py-3.5">Trainer Staff</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Disbursement Due Day</th>
                <th className="px-5 py-3.5">Monthly Salary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#71697a]">
                    {search ? "No trainer records match your search." : "No salary records for this month."}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const initials = r.trainerName
                    ? r.trainerName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "T";

                  return (
                    <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f6d0] text-xs font-semibold text-[#242424]">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#242424]">{r.trainerName}</p>
                            <p className="text-[11px] text-[#71697a]">{r.trainerEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#71697a]">
                        {r.trainerPhone || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#242424]">
                          <Calendar className="h-3.5 w-3.5 text-[#71697a]" />
                          <span>Day {r.salaryDueDay} of month</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#242424] tabular-nums">
                        ₹{r.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={r.status}
                          label={r.status === "PAID" ? "Disbursed" : "Pending Payment"}
                        />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {r.status === "PAID" ? (
                          <span className="text-[11px] font-mono text-[#71697a]">
                            Paid {r.paidAt ? format(new Date(r.paidAt), "dd MMM") : ""}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(r)}
                            disabled={markingId === r.id}
                            className="apple-button-press inline-flex items-center gap-1 rounded-full bg-[#242424] px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
                          >
                            {markingId === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Mark Paid</span>
                          </button>
                        )}
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
