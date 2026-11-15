"use client";

import { useState } from "react";
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
      {/* -------------------------------------------------------------------- */}
      {/* TOP TRIALS SUMMARY BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4be9e] text-[#242424] shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#242424]">
                Free Trial Members & Leads
              </h2>
              <span className="rounded-full bg-[#e4be9e]/50 px-2.5 py-0.5 text-xs font-semibold text-[#8c5222]">
                {trials.length} active trials
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#71697a]">
              Prospects testing the facility. Convert visitors into paid subscribers with sequential receipts.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SEARCH TOOLBAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858585]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trials by customer or coach..."
            className="w-full rounded-full border border-[rgba(40,40,40,0.08)] bg-white pl-9 pr-4 py-1.5 text-xs text-[#242424] placeholder:text-[#858585] focus:border-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>
        <span className="text-xs text-[#71697a]">
          Showing {filtered.length} of {trials.length} trials
        </span>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TRIALS TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
              <tr>
                <th className="px-5 py-3.5">Trial Member</th>
                <th className="px-5 py-3.5">Assigned Coach</th>
                <th className="px-5 py-3.5">Trial Expiration</th>
                <th className="px-5 py-3.5">Days Left</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#71697a]">
                    {search ? "No trial members match your search." : "No active trial members currently."}
                  </td>
                </tr>
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
                    <tr key={t.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e4be9e]/50 text-xs font-semibold text-[#242424]">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#242424]">{t.name}</p>
                            <p className="text-[11px] text-[#71697a]">{t.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#71697a]">
                        {t.trainerName}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#71697a]">
                        {t.trialEndsAt
                          ? format(new Date(t.trialEndsAt), "dd MMM yyyy")
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            daysRemaining <= 1
                              ? "bg-rose-50 text-rose-800"
                              : daysRemaining <= 3
                              ? "bg-[#e4be9e]/50 text-[#8c5222]"
                              : "bg-[#d0e1d4]/50 text-emerald-900"
                          }`}
                        >
                          {daysRemaining <= 0 ? "Ends Today" : `${daysRemaining} days left`}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status="TRIAL" label="Free Trial" />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setConvertingCustomer(t)}
                          className="apple-button-press inline-flex items-center gap-1.5 rounded-full bg-[#242424] px-3.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Convert to Paid</span>
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
