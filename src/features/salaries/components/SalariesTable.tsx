"use client";

import { useState } from "react";
import { SalaryRecordItem, SalaryOverview } from "@/types/salary.types";
import { markSalaryPaidAction } from "@/actions/salary.actions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LuCreditCard,
  LuCalendar,
  LuCheck,
  LuLoader,
  LuSearch,
  LuTrendingUp,
  LuClock,
} from "react-icons/lu";
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
      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Payroll ({overview.month})
            </span>
            <LuCreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">
            ₹{overview.totalSalaries.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {overview.records.length} trainers on roster
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Paid Disbursed
            </span>
            <LuTrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{overview.totalPaid.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {overview.records.filter((r) => r.status === "PAID").length} disbursed
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Pending Disbursement
            </span>
            <LuClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            ₹{overview.totalPending.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {overview.records.filter((r) => r.status === "PENDING").length} pending
          </span>
        </div>
      </div>

      {/* Filter and Month Picker Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainer by name or email..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="monthPicker" className="text-xs font-semibold text-muted-foreground">
            Payroll Month:
          </label>
          <input
            id="monthPicker"
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Salary Records Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Trainer</th>
                <th className="px-6 py-4">Monthly Salary</th>
                <th className="px-6 py-4">Due Day</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Disbursed At</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No trainer salary records found for {overview.month}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isMarking = markingId === r.id;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{r.trainerName}</div>
                        <div className="text-xs text-muted-foreground">{r.trainerEmail}</div>
                        {r.trainerPhone && (
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {r.trainerPhone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-foreground">
                          ₹{r.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <LuCalendar className="h-3.5 w-3.5" />
                          <span>Day {r.salaryDueDay} of month</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} label={r.status} />
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {r.paidAt ? (
                          <>
                            <div className="font-medium text-foreground">
                              {format(new Date(r.paidAt), "dd MMM yyyy")}
                            </div>
                            <div className="text-[11px]">
                              {format(new Date(r.paidAt), "hh:mm a")}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {r.status === "PENDING" ? (
                          <button
                            onClick={() => handleMarkPaid(r)}
                            disabled={isMarking}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            {isMarking ? (
                              <LuLoader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <LuCheck className="h-3.5 w-3.5" />
                            )}
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <LuCheck className="h-3.5 w-3.5" />
                            <span>Paid</span>
                          </span>
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

