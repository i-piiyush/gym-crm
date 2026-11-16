"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { TrainerListItem } from "@/types/person.types";
import { TrainerLeavesOverview } from "@/types/trainer-leave.types";
import { markTrainerLeaveSchema } from "@/schemas/trainer-leave.schema";
import { listTrainerLeavesAction, markTrainerLeaveAction, removeTrainerLeaveAction } from "@/actions/trainer-leave.actions";

export function TrainerLeaveDialog({ trainer, onClose }: { trainer: TrainerListItem; onClose: () => void }) {
  const router = useRouter();
  const [overview, setOverview] = useState<TrainerLeavesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"PAID" | "UNPAID">("UNPAID");
  const [reason, setReason] = useState("");
  const request = useRef(0);

  const load = useCallback(async (month?: string, initialize = false) => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    try {
      const res = await listTrainerLeavesAction({ trainerId: trainer.id, month });
      if (id !== request.current) return;
      if (!res.success) { setError(res.error || "Could not load leave records."); return; }
      setOverview(res.data);
      if (initialize) { setStartDate(res.data.today); setEndDate(res.data.today); }
    } catch { if (id === request.current) setError("Could not load leave records. Try again."); }
    finally { if (id === request.current) setLoading(false); }
  }, [trainer.id]);

  useEffect(() => { void load(undefined, true); return () => { request.current++; }; }, [load]);

  const markLeave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || loading) return;
    const parsed = markTrainerLeaveSchema.safeParse({ trainerId: trainer.id, startDate, endDate, type, reason });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "Check the leave details."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await markTrainerLeaveAction(parsed.data);
      if (!res.success) { setError(res.error || "Could not mark leave."); return; }
      toast.success(`Marked ${res.data?.days ?? 1} leave day(s) for ${trainer.name}.`);
      await load(startDate.slice(0, 7));
      router.refresh();
    } catch { setError("Could not mark leave. Try again."); }
    finally { setBusy(false); }
  };

  const removeLeave = async (leaveId: string) => {
    if (busy || loading) return;
    setBusy(true);
    setError("");
    try {
      const res = await removeTrainerLeaveAction({ leaveId });
      if (!res.success) { setError(res.error || "Could not remove leave."); return; }
      toast.success("Leave removed and pending salary recalculated.");
      await load(overview?.month);
      router.refresh();
    } catch { setError("Could not remove leave. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }} onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}>
        <DialogTitle className="pr-7">Manage leave · {trainer.name}</DialogTitle>
        <DialogDescription>Paid leave excuses a missed check-in. Unpaid leave uses the trainer’s ₹{trainer.holidayDeductionPerDay.toLocaleString("en-IN")} daily deduction. Only completed days are counted.</DialogDescription>
        <form className="mt-5 space-y-4" onSubmit={markLeave}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium" htmlFor="leave-start">Start date</label><Input id="leave-start" type="date" required min={overview?.joinedDate} value={startDate} disabled={busy || loading} onChange={(e) => { setStartDate(e.target.value); if (endDate < e.target.value) setEndDate(e.target.value); }} /></div>
            <div><label className="mb-1 block text-sm font-medium" htmlFor="leave-end">End date</label><Input id="leave-end" type="date" required min={startDate || overview?.joinedDate} value={endDate} disabled={busy || loading} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium" htmlFor="leave-type">Leave type</label><Combobox id="leave-type" value={type} onValueChange={(value) => setType(value as "PAID" | "UNPAID")} disabled={busy || loading} options={[{ value: "UNPAID", label: "Unpaid leave — deduct for missed check-in" }, { value: "PAID", label: "Paid leave — no salary deduction" }]} searchPlaceholder="Search leave types…" /></div>
          <div><label className="mb-1 block text-sm font-medium" htmlFor="leave-reason">Reason (optional)</label><textarea id="leave-reason" maxLength={500} value={reason} disabled={busy || loading} onChange={(e) => setReason(e.target.value)} className="min-h-20 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <p className="text-xs text-muted-foreground">Saving an overlapping range updates those leave days. Months with a paid salary are locked.</p>
          <Button type="submit" disabled={busy || loading || !overview}>{busy ? "Saving…" : "Mark leave"}</Button>
        </form>
        <div className="mt-5 border-t border-border pt-4">
          <label htmlFor="leave-month" className="mb-2 block text-sm font-medium">Recorded leave</label>
          <Input id="leave-month" type="month" value={overview?.month || ""} disabled={busy || loading} onChange={(e) => { if (e.target.value) void load(e.target.value); }} />
          {loading ? <p className="mt-3 text-sm text-muted-foreground" role="status">Loading leave…</p> : overview && (
            overview.records.length ? <ul className="mt-3 max-h-60 divide-y divide-border overflow-y-auto">{overview.records.map((leave) => (
              <li key={leave.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="text-sm font-medium">{leave.date} · {leave.type === "PAID" ? "Paid leave" : "Unpaid leave"}</p>{leave.reason && <p className="break-words text-xs text-muted-foreground">{leave.reason}</p>}</div>
                {leave.locked ? <span className="text-xs text-muted-foreground">Salary paid · locked</span> : <Button type="button" variant="outline" size="sm" disabled={busy} aria-label={`Remove leave on ${leave.date}`} onClick={() => void removeLeave(leave.id)}>Remove</Button>}
              </li>
            ))}</ul> : <p className="mt-3 text-sm text-muted-foreground">No leave recorded for this month.</p>
          )}
        </div>
        {error && <div role="alert" className="mt-3 text-sm text-destructive">{error}{!overview && !loading && <Button className="ml-2" type="button" variant="outline" size="sm" onClick={() => void load(undefined, true)}>Retry</Button>}</div>}
        <div className="mt-5 flex justify-end"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Close</Button></div>
      </DialogContent>
    </Dialog>
  );
}
