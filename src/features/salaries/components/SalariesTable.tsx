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
import { SalaryRecordItem, SalaryOverview } from "@/types/salary.types";
import { markSalaryPaidAction } from "@/actions/salary.actions";
import { HolidayRateDialog } from "./HolidayRateDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const [overview, setOverview] = useState<SalaryOverview>(initialOverview);
  const [search, setSearch] = useState("");
  useEffect(() => {
    setOverview(initialOverview);
  }, [initialOverview]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<SalaryRecordItem | null>(null);

  const selectedMonth = overview.month || currentMonth;

  const filteredRecords = overview.records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.trainerName.toLowerCase().includes(q) ||
      r.trainerEmail.toLowerCase().includes(q)
    );
  });

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth || markingId) return;
    router.push(`/admin/salaries?month=${newMonth}`);
  };

  const handleMarkPaid = async (record: SalaryRecordItem) => {
    if (markingId || editingRecord) return;
    setMarkingId(record.id);
    try {
      const res = await markSalaryPaidAction({ salaryRecordId: record.id, expectedAmount: record.amount });
      if (!res.success) {
        toast.error(res.error || "Failed to mark salary as paid.");
        router.refresh();
        return;
      }

      toast.success(
        `Recorded paid salary of ₹${res.data.amount.toLocaleString("en-IN")} for ${record.trainerName}`,
      );
      const paidRecord = res.data;
      setOverview((prev) => {
        const records = prev.records.map((r): SalaryRecordItem => r.id === paidRecord.id ? { ...r, ...paidRecord } : r);
        const totalPaid = records.filter((r) => r.status === "PAID").reduce((sum, r) => sum + Math.round(r.amount * 100), 0) / 100;
        const totalPending = records.filter((r) => r.status === "PENDING").reduce((sum, r) => sum + Math.round(r.amount * 100), 0) / 100;
        return { ...prev, records, totalPaid, totalPending, totalSalaries: (Math.round(totalPaid * 100) + Math.round(totalPending * 100)) / 100,
          totalDeductions: records.reduce((sum, r) => sum + Math.round(r.deductionAmount * 100), 0) / 100 };
      });
      router.refresh();
    } catch {
      toast.error("An error occurred while updating salary status.");
      router.refresh();
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* 3 PAYROLL METRIC CARDS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="apple-card p-5">
          <span className="text-xs font-medium text-muted-foreground">Salary Deductions</span>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums">₹{overview.totalDeductions.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground">Missed check-ins, excluding paid leave</span>
        </div>
        {/* Total Payroll */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Payroll ({overview.month})
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums">
            ₹{overview.totalSalaries.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {overview.records.length} trainers on coaching roster
          </span>
        </div>

        {/* Paid Disbursed */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Paid Disbursed
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-honeydew/60 text-status-active-fg">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums">
            ₹{overview.totalPaid.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-status-active-fg font-medium">
            Disbursed and recorded
          </span>
        </div>

        {/* Pending Disbursement */}
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Pending Disbursement
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-desert/50 text-status-warning-fg">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold font-mono text-foreground tabular-nums">
            ₹{overview.totalPending.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-status-warning-fg font-medium">
            {overview.records.filter((r) => r.status === "PENDING").length}{" "}
            pending payments
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Deductions count every completed gym-local day without a check-in from the trainer’s joining date, including weekends. Today, future days, and paid leave are excluded. Paid salary statements are locked.</p>

      {/* -------------------------------------------------------------------- */}
      {/* FILTER & MONTH SELECTOR TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trainer name or email..."
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Payroll Month:
          </label>
          <input
            type="month"
            aria-label="Payroll month"
            disabled={!!markingId}
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SALARIES DATA TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
              <TableRow>
                <TableHead className="px-5 py-3.5">Trainer Staff</TableHead>
                <TableHead className="px-5 py-3.5">Contact</TableHead>
                <TableHead className="px-5 py-3.5">
                  Disbursement Due Day
                </TableHead>
                <TableHead className="px-5 py-3.5">Base Salary</TableHead>
                <TableHead className="px-5 py-3.5">Missed Days / Rate</TableHead>
                <TableHead className="px-5 py-3.5">Deduction</TableHead>
                <TableHead className="px-5 py-3.5">Payable Salary</TableHead>
                <TableHead className="px-5 py-3.5">Status</TableHead>
                <TableHead className="px-5 py-3.5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {search
                      ? "No trainer records match your search."
                      : "No salary records for this month."}
                  </TableCell>
                </TableRow>
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
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-semibold text-foreground">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {r.trainerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {r.trainerEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {r.trainerPhone || "—"}
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Day {r.salaryDueDay} of month</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-3.5 font-mono text-xs text-foreground tabular-nums">₹{r.baseAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="px-5 py-3.5 text-xs text-foreground">
                        <p>{r.holidayDays} day(s)</p><p className="text-muted-foreground">₹{r.holidayDeductionPerDay.toLocaleString("en-IN")} / day</p>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 font-mono text-xs text-foreground tabular-nums">−₹{r.deductionAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground tabular-nums">
                        ₹{r.amount.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <StatusBadge
                          status={r.status}
                          label={
                            r.status === "PAID"
                              ? "Disbursed"
                              : "Pending Payment"
                          }
                        />
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-right">
                        {r.status === "PENDING" && <Button type="button" size="sm" variant="outline" className="mr-2" disabled={!!markingId} onClick={() => setEditingRecord(r)}>Edit rate</Button>}
                        {r.status === "PAID" ? (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            Paid{" "}
                            {r.paidAt
                              ? format(new Date(r.paidAt), "dd MMM")
                              : ""}
                          </span>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleMarkPaid(r)}
                            disabled={!!markingId}
                            className="apple-button-press inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/85"
                          >
                            {markingId === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Mark Paid</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {editingRecord && <HolidayRateDialog trainerId={editingRecord.trainerId} trainerName={editingRecord.trainerName} rate={editingRecord.holidayDeductionPerDay} record={editingRecord} onClose={() => setEditingRecord(null)} />}
    </div>
  );
}
