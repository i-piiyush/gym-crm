"use client";

import { useState } from "react";
import { CustomerListItem, PlanOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { format } from "date-fns";
import {
  LuSearch,
  LuClock,
  LuReceipt,
  LuSparkles,
  LuCalendar,
} from "react-icons/lu";

interface TrialsTableProps {
  trials: CustomerListItem[];
  plans: PlanOption[];
}

export function TrialsTable({ trials: initialTrials, plans }: TrialsTableProps) {
  const [trials] = useState<CustomerListItem[]>(initialTrials);
  const [search, setSearch] = useState("");
  const [convertingCustomer, setConvertingCustomer] = useState<CustomerListItem | null>(null);

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
      {/* Banner summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <LuSparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Active Free Trials</h2>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                {trials.length} members on trial
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prospects testing the facility before purchasing a membership plan.
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trials by customer or trainer..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {trials.length} active trials
        </span>
      </div>

      {/* Trials Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Assigned Trainer</th>
                <th className="px-6 py-4">Trial Expiration</th>
                <th className="px-6 py-4">Days Left</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {search
                      ? "No trials match your search query."
                      : "No customers currently on free trial."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  let daysLeft = 0;
                  let isUrgent = false;

                  if (t.trialEndsAt) {
                    const diffMs = new Date(t.trialEndsAt).getTime() - now;
                    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    isUrgent = daysLeft <= 2;
                  }

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.email}</div>
                        {t.phone && (
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {t.phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        {t.trainerName}
                      </td>

                      <td className="px-6 py-4">
                        {t.trialEndsAt ? (
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <LuCalendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{format(new Date(t.trialEndsAt), "dd MMM yyyy")}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            daysLeft <= 0
                              ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                              : isUrgent
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          <LuClock className="h-3 w-3" />
                          <span>
                            {daysLeft <= 0 ? "Ends today" : `${daysLeft} days left`}
                          </span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status="TRIAL" label="TRIAL" />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setConvertingCustomer(t)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <LuReceipt className="h-3.5 w-3.5" />
                          <span>Convert to Member</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert to Member / Record Payment Dialog */}
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
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

