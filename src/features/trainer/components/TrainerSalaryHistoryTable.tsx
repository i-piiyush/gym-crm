"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { SalaryRecordItem } from "@/types/salary.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import {
  Banknote as LuBanknote,
  Calendar as LuCalendar,
  Check as LuCheck,
  Clock as LuClock,
} from "lucide-react";

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
            <LuBanknote className="h-4 w-4 text-emerald-600 " />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-emerald-600 ">
            ₹{totalEarned.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Cumulative received salary
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Pending Compensation
            </span>
            <LuClock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-amber-500">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Due for current/prior periods
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Payroll Statements
            </span>
            <LuCalendar className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground">
            {records.length}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Monthly salary cycles
          </span>
        </div>
      </div>

      {/* Salary Statements Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-sm">
            <TableHeader className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground ">
              <TableRow>
                <TableHead className="px-6 py-4">Payroll Month</TableHead>
                <TableHead className="px-6 py-4">Base Salary</TableHead>
                <TableHead className="px-6 py-4">Missed Days / Rate</TableHead>
                <TableHead className="px-6 py-4">Deduction</TableHead>
                <TableHead className="px-6 py-4">Payable Salary</TableHead>
                <TableHead className="px-6 py-4">Due Day</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4 text-right">
                  Disbursement Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-12 text-center text-muted-foreground text-xs"
                  >
                    No payroll statements recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-muted/30  transition-colors"
                  >
                    <TableCell className="px-6 py-4 font-semibold text-xs text-foreground">
                      {r.month}
                    </TableCell>

                    <TableCell className="px-6 py-4 font-mono text-sm text-foreground">₹{r.baseAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="px-6 py-4 text-xs text-foreground">{r.holidayDays} day(s)<p className="text-muted-foreground">₹{r.holidayDeductionPerDay.toLocaleString("en-IN")} / day</p></TableCell>
                    <TableCell className="px-6 py-4 font-mono text-sm text-foreground">−₹{r.deductionAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        ₹{r.amount.toLocaleString("en-IN")}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                      Day {r.salaryDueDay} of month
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <StatusBadge status={r.status} label={r.status} />
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {r.paidAt ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-emerald-600  flex items-center gap-1">
                            <LuCheck className="h-3.5 w-3.5" />
                            <span>
                              Paid on{" "}
                              {format(new Date(r.paidAt), "dd MMM yyyy")}
                            </span>
                          </span>
                          <span className="text-[11px]">
                            {format(new Date(r.paidAt), "hh:mm a")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600  font-medium">
                          Pending disbursement by gym owner
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Pending statements update for completed days without a check-in, including weekends. Paid leave, today, and future days are excluded. Paid statements keep their recorded calculation.</p>
    </div>
  );
}
