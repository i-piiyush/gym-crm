"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTrainerHolidayRateAction } from "@/actions/salary.actions";
import { updateTrainerHolidayRateSchema } from "@/schemas/salary.schema";
import { calculateHolidaySalary, MAX_SALARY_AMOUNT } from "@/lib/salary-calculation";
import { SalaryRecordItem } from "@/types/salary.types";

export function HolidayRateDialog({ trainerId, trainerName, rate, record, onClose }: {
  trainerId: string; trainerName: string; rate: number; record?: SalaryRecordItem; onClose: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(rate));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const parsed = updateTrainerHolidayRateSchema.safeParse({ trainerId, holidayDeductionPerDay: value.trim() ? Number(value) : NaN });
  const preview = record && parsed.success ? calculateHolidaySalary(record.baseAmount, parsed.data.holidayDeductionPerDay, record.holidayDays, record.month) : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "Enter a valid rate."); return; }
    setBusy(true); setError("");
    try {
      const res = await updateTrainerHolidayRateAction(parsed.data);
      if (!res.success) { setError(res.error || "Could not update deduction rate."); return; }
      toast.success("Deduction rate saved and pending salaries recalculated.");
      router.refresh(); onClose();
    } catch { setError("Could not update deduction rate. Try again."); }
    finally { setBusy(false); }
  };

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }} onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}>
      <DialogTitle className="pr-7">Deduction rate · {trainerName}</DialogTitle>
      <DialogDescription>Applied to each completed day without a check-in, starting from the joining date. Paid leave is excluded. This updates all pending salaries and future months; paid salaries remain locked.</DialogDescription>
      <form onSubmit={save} className="mt-5 space-y-4">
        <div><label htmlFor="holiday-rate" className="mb-1 block text-sm font-medium">Deduction per missed day (₹)</label><Input id="holiday-rate" type="number" min={0} max={MAX_SALARY_AMOUNT} step="0.01" required value={value} disabled={busy} onChange={(e) => setValue(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">₹0 disables deductions. Payable salary cannot fall below ₹0.</p></div>
        {preview && record && <p className="rounded-lg bg-muted p-3 text-sm">{record.month}: {record.holidayDays} missed day(s) · ₹{preview.deductionAmount.toLocaleString("en-IN")} deduction · ₹{preview.amount.toLocaleString("en-IN")} payable.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save rate"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
