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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [renewingCustomer, setRenewingCustomer] =
    useState<CustomerListItem | null>(null);

  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const id = params.get("renew");
    if (id)
      setRenewingCustomer(
        [
          ...buckets.expiringIn7Days,
          ...buckets.expiringIn15Days,
          ...buckets.expiringIn30Days,
          ...buckets.expired,
        ].find((c) => c.id === id) || null,
      );
  }, [params, buckets]);
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
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Membership plans</h2>
          <Link
            href="/admin/settings"
            className="text-xs text-dim hover:text-foreground"
          >
            Manage plans →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.length ? (
            plans.map((plan, i) => (
              <div key={plan.id} className="apple-card p-5">
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
                  ₹{plan.price.toLocaleString("en-IN")}
                  <span className="ml-2 text-xs font-normal text-dim">
                    / {plan.durationDays} days
                  </span>
                </p>
                <p className="mt-3 text-xs text-dim">
                  Available for new members and renewals
                </p>
              </div>
            ))
          ) : (
            <p className="py-5 text-sm text-dim">
              No active plans yet.{" "}
              <Link
                href="/admin/settings"
                className="font-medium text-foreground"
              >
                Create your first plan →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4 COHORT TABS SWITCHER */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <div role="group" aria-label="Membership expiry filters" className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl bg-muted p-1 text-xs sm:rounded-full">
          <Button
            variant="ghost"
            aria-pressed={activeTab === "7DAYS"}
            type="button"
            onClick={() => setActiveTab("7DAYS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "7DAYS"
                ? "bg-card text-status-warning-fg shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Expiring in 7 Days ({buckets.expiringIn7Days.length})</span>
          </Button>

          <Button
            variant="ghost"
            aria-pressed={activeTab === "15DAYS"}
            type="button"
            onClick={() => setActiveTab("15DAYS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "15DAYS"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>15 Days ({buckets.expiringIn15Days.length})</span>
          </Button>

          <Button
            variant="ghost"
            aria-pressed={activeTab === "30DAYS"}
            type="button"
            onClick={() => setActiveTab("30DAYS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "30DAYS"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>30 Days ({buckets.expiringIn30Days.length})</span>
          </Button>

          <Button
            variant="ghost"
            aria-pressed={activeTab === "EXPIRED"}
            type="button"
            onClick={() => setActiveTab("EXPIRED")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "EXPIRED"
                ? "bg-card text-status-danger-fg shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Expired Passes ({buckets.expired.length})</span>
          </Button>
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
            placeholder="Search member by name or email..."
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length}{" "}
          {filtered.length === 1 ? "subscription" : "subscriptions"} in this
          cohort
        </span>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* SUBSCRIPTIONS TABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
              <TableRow>
                <TableHead className="px-5 py-3.5">Member</TableHead>
                <TableHead className="px-5 py-3.5">Current Pass</TableHead>
                <TableHead className="px-5 py-3.5">Assigned Coach</TableHead>
                <TableHead className="px-5 py-3.5">Expiration Date</TableHead>
                <TableHead className="px-5 py-3.5">Timeline Status</TableHead>
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
                    No members in this renewal cohort.
                  </TableCell>
                </TableRow>
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
                    <TableRow
                      key={customer.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-semibold text-foreground">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {customer.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-3.5 font-medium text-foreground">
                        {customer.planName || "Custom Plan"}
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-muted-foreground">
                        {customer.trainerName}
                      </TableCell>

                      <TableCell className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {customer.membershipEnd
                          ? format(
                              new Date(customer.membershipEnd),
                              "dd MMM yyyy",
                            )
                          : "—"}
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        {daysRemaining <= 0 ? (
                          <span className="rounded-full bg-status-danger-bg px-2.5 py-0.5 text-[10px] font-semibold text-status-danger-fg">
                            Expired
                          </span>
                        ) : (
                          <span className="rounded-full bg-desert/50 px-2.5 py-0.5 text-[10px] font-semibold text-status-warning-fg">
                            {daysRemaining}{" "}
                            {daysRemaining === 1 ? "day" : "days"} left
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          type="button"
                          onClick={() => setRenewingCustomer(customer)}
                          className="apple-button-press inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/85"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Renew Pass</span>
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

      {/* Renew Modal Dialog */}
      {renewingCustomer && (
        <RecordPaymentDialog
          isOpen={true}
          onClose={() => {
            setRenewingCustomer(null);
            if (params.get("renew"))
              router.replace("/admin/subscriptions", { scroll: false });
          }}
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
