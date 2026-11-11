"use client";

import { useState } from "react";
import { CustomerListItem, PlanOption } from "@/types/person.types";
import { SubscriptionBuckets } from "@/services/membership.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { format } from "date-fns";
import {
  LuClock,
  LuTriangleAlert,
  LuCalendar,
  LuReceipt,
  LuSearch,
} from "react-icons/lu";

interface SubscriptionsViewProps {
  buckets: SubscriptionBuckets;
  plans: PlanOption[];
}

export function SubscriptionsView({ buckets, plans }: SubscriptionsViewProps) {
  const [activeTab, setActiveTab] = useState<
    "7DAYS" | "15DAYS" | "30DAYS" | "EXPIRED"
  >("7DAYS");
  const [search, setSearch] = useState("");
  const [renewingCustomer, setRenewingCustomer] = useState<CustomerListItem | null>(null);

  const getListForTab = () => {
    switch (activeTab) {
      case "7DAYS":
        return buckets.expiringIn7Days;
      case "15DAYS":
        return buckets.expiringIn15Days;
      case "30DAYS":
        return buckets.expiringIn30Days;
      case "EXPIRED":
        return buckets.expired;
    }
  };

  const list = getListForTab();
  const now = new Date().getTime();

  const filtered = list.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.trainerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("7DAYS")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "7DAYS"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuClock className="h-4 w-4" />
          <span>Expiring in 7 Days ({buckets.expiringIn7Days.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("15DAYS")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "15DAYS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuCalendar className="h-4 w-4" />
          <span>Expiring in 15 Days ({buckets.expiringIn15Days.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("30DAYS")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "30DAYS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuCalendar className="h-4 w-4" />
          <span>Expiring in 30 Days ({buckets.expiringIn30Days.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("EXPIRED")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "EXPIRED"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuTriangleAlert className="h-4 w-4" />
          <span>Expired / Overdue ({buckets.expired.length})</span>
        </button>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions by customer or trainer..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {list.length} in this category
        </span>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Assigned Trainer</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    {search
                      ? "No records match your search filter."
                      : "No members in this renewal bucket."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  let daysDiff = 0;
                  if (c.membershipEnd) {
                    const diffMs = new Date(c.membershipEnd).getTime() - now;
                    daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  }

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                        {c.phone && (
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {c.phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        {c.trainerName}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-foreground">
                        {c.planName || "Custom"}
                      </td>

                      <td className="px-6 py-4 text-xs text-foreground">
                        {c.membershipEnd ? (
                          format(new Date(c.membershipEnd), "dd MMM yyyy")
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            daysDiff < 0
                              ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                              : daysDiff <= 7
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          <LuClock className="h-3 w-3" />
                          <span>
                            {daysDiff < 0
                              ? `Expired ${Math.abs(daysDiff)}d ago`
                              : daysDiff === 0
                              ? "Expires today"
                              : `${daysDiff} days left`}
                          </span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} label={c.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setRenewingCustomer(c)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <LuReceipt className="h-3.5 w-3.5" />
                          <span>Renew</span>
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

      {/* Renew / Record Payment Modal */}
      {renewingCustomer && (
        <RecordPaymentDialog
          isOpen={true}
          onClose={() => setRenewingCustomer(null)}
          customers={[
            {
              id: renewingCustomer.id,
              name: renewingCustomer.name,
              email: renewingCustomer.email,
              currentPlanName: renewingCustomer.planName,
              membershipEnd: renewingCustomer.membershipEnd,
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

