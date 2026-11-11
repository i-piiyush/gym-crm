"use client";

import { SalaryRecordItem } from "@/types/salary.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import { LuBanknote, LuCalendar, LuCheck, LuClock } from "react-icons/lu";

interface TrainerSalaryHistoryTableProps {
  records: SalaryRecordItem[];
}

export function TrainerSalaryHistoryTable({
  records,
}: TrainerSalaryHistoryTableProps) {
  const totalEarned = records
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingAmount = records
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Disbursed
            </span>
            <LuBanknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{totalEarned.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">Cumulative received salary</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Pending Compensation
            </span>
            <LuClock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-500">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">Due for current/prior periods</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Payroll Statements
            </span>
            <LuCalendar className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">
            {records.length}
          </p>
          <span className="text-[11px] text-muted-foreground">Monthly salary cycles</span>
        </div>
      </div>

      {/* Salary Statements Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Payroll Month</th>
                <th className="px-6 py-4">Monthly Salary</th>
                <th className="px-6 py-4">Due Day</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Disbursement Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    No payroll statements recorded yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-xs text-foreground">
                      {r.month}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-foreground">
                        ₹{r.amount.toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      Day {r.salaryDueDay} of month
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} label={r.status} />
                    </td>

                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {r.paidAt ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <LuCheck className="h-3.5 w-3.5" />
                            <span>Paid on {format(new Date(r.paidAt), "dd MMM yyyy")}</span>
                          </span>
                          <span className="text-[11px]">
                            {format(new Date(r.paidAt), "hh:mm a")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Pending disbursement by gym owner
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

