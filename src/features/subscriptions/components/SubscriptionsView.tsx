"use client";

import { useState } from "react";
import { CustomerListItem, PlanOption } from "@/types/person.types";
import { SubscriptionBuckets } from "@/services/membership.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { format } from "date-fns";
import {
  Clock,
  Calendar,
  AlertTriangle,
  Receipt,
  Search,
  CheckCircle2,
} from "lucide-react";

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
      {/* -------------------------------------------------------------------- */}
      {/* 4 COHORT TABS SWITCHER */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(40,40,40,0.06)] pb-3">
        <div className="inline-flex rounded-full bg-stone-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("7DAYS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "7DAYS"
                ? "bg-white text-[#8c5222] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Expiring in 7 Days ({buckets.expiringIn7Days.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("15DAYS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "15DAYS"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>15 Days ({buckets.expiringIn15Days.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("30DAYS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "30DAYS"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>30 Days ({buckets.expiringIn30Days.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("EXPIRED")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "EXPIRED"
                ? "bg-white text-rose-800 shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Expired Passes ({buckets.expired.length})</span>
          </button>
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
            placeholder="Search member by name or email..."
            className="w-full rounded-full border border-[rgba(40,40,40,0.08)] bg-white pl-9 pr-4 py-1.5 text-xs text-[#242424] placeholder:text-[#858585] focus:border-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>
        <span className="text-xs text-[#71697a]">
          {filtered.length} {filtered.length === 1 ? "subscription" : "subscriptions"} in this cohort
        </span>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SUBSCRIPTIONS TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
              <tr>
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Current Pass</th>
                <th className="px-5 py-3.5">Assigned Coach</th>
                <th className="px-5 py-3.5">Expiration Date</th>
                <th className="px-5 py-3.5">Timeline Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#71697a]">
                    No members in this renewal cohort.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  let daysRemaining = 0;
                  if (customer.membershipEnd) {
                    const end = new Date(customer.membershipEnd).getTime();
                    daysRemaining = Math.ceil((end - now) / 86400000);
                  }

                  const initials = customer.name
                    ? customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "M";

                  return (
                    <tr key={customer.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f6d0] text-xs font-semibold text-[#242424]">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#242424]">{customer.name}</p>
                            <p className="text-[11px] text-[#71697a]">{customer.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-[#242424]">
                        {customer.planName || "Custom Plan"}
                      </td>

                      <td className="px-5 py-3.5 text-[#71697a]">
                        {customer.trainerName}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#71697a]">
                        {customer.membershipEnd
                          ? format(new Date(customer.membershipEnd), "dd MMM yyyy")
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        {daysRemaining <= 0 ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800">
                            Expired
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#e4be9e]/50 px-2.5 py-0.5 text-[10px] font-semibold text-[#8c5222]">
                            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setRenewingCustomer(customer)}
                          className="apple-button-press inline-flex items-center gap-1.5 rounded-full bg-[#242424] px-3.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Renew Pass</span>
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

      {/* Renew Modal Dialog */}
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
            setRenewingCustomer(null);
          }}
        />
      )}
    </div>
  );
}
