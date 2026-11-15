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
import { CustomerListItem, PlanOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { format } from "date-fns";
import {
  Search,
  Clock,
  Receipt,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface TrialsTableProps {
  trials: CustomerListItem[];
  plans: PlanOption[];
}

export function TrialsTable({
  trials: initialTrials,
  plans,
}: TrialsTableProps) {
  const [trials, setTrials] = useState<CustomerListItem[]>(initialTrials);
  const [search, setSearch] = useState("");
  useEffect(() => {
    setTrials(initialTrials);
  }, [initialTrials]);
  const [convertingCustomer, setConvertingCustomer] =
    useState<CustomerListItem | null>(null);

  const now = new Date().getTime();

  const filtered = trials.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.trainerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* TOP TRIALS SUMMARY BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-desert text-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Free Trial Members & Leads
              </h2>
              <span className="rounded-full bg-desert/50 px-2.5 py-0.5 text-xs font-semibold text-status-warning-fg">
                {trials.length} active trials
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Prospects testing the facility. Convert visitors into paid
              subscribers with sequential receipts.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SEARCH TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trials by customer or coach..."
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {trials.length} trials
        </span>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TRIALS TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
              <TableRow>
                <TableHead className="px-5 py-3.5">Trial Member</TableHead>
                <TableHead className="px-5 py-3.5">Assigned Coach</TableHead>
                <TableHead className="px-5 py-3.5">Trial Expiration</TableHead>
                <TableHead className="px-5 py-3.5">Days Left</TableHead>
                <TableHead className="px-5 py-3.5">Status</TableHead>
                <TableHead className="px-5 py-3.5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {search
                      ? "No trial members match your search."
                      : "No active trial members currently."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  let daysRemaining = 0;
                  if (t.trialEndsAt) {
                    const end = new Date(t.trialEndsAt).getTime();
                    daysRemaining = Math.ceil((end - now) / 86400000);
                  }

                  const initials = t.name
                    ? t.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "M";

                  return (
                    <TableRow
                      key={t.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-desert/50 text-xs font-semibold text-foreground">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {t.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {t.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-muted-foreground">
                        {t.trainerName}
                      </TableCell>

                      <TableCell className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {t.trialEndsAt
                          ? format(new Date(t.trialEndsAt), "dd MMM yyyy")
                          : "—"}
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            daysRemaining <= 1
                              ? "bg-status-danger-bg text-status-danger-fg"
                              : daysRemaining <= 3
                                ? "bg-desert/50 text-status-warning-fg"
                                : "bg-honeydew/50 text-status-active-fg"
                          }`}
                        >
                          {daysRemaining <= 0
                            ? "Ends Today"
                            : `${daysRemaining} days left`}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <StatusBadge status="TRIAL" label="Free Trial" />
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          type="button"
                          onClick={() => setConvertingCustomer(t)}
                          className="apple-button-press inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/85"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Convert to Paid</span>
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

      {/* Convert to Paid Dialog */}
      {convertingCustomer && (
        <RecordPaymentDialog
          isOpen={true}
          onClose={() => setConvertingCustomer(null)}
          customers={[
            {
              id: convertingCustomer.id,
              name: convertingCustomer.name,
              email: convertingCustomer.email,
              currentPlanName: "Free Trial",
            },
          ]}
          plans={plans}
          onPaymentSuccess={() => {
            setConvertingCustomer(null);
          }}
        />
      )}
    </div>
  );
}
