"use client";

import { useState } from "react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  LuSearch,
  LuCalendarCheck,
  LuClock,
  LuUser,
  LuPhone,
  LuMail,
} from "react-icons/lu";

interface ClientItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  planName: string;
  membershipStart: Date | null;
  membershipEnd: Date | null;
  trialEndsAt: Date | null;
  checkedInToday: boolean;
  checkInTime: Date | null;
}

interface TrainerClientsTableProps {
  clients: ClientItem[];
  todayDateStr: string;
}

export function TrainerClientsTable({
  clients,
  todayDateStr,
}: TrainerClientsTableProps) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  });

  const checkedInCount = clients.filter((c) => c.checkedInToday).length;

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LuUser className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                My Coaching Clients
              </h2>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                {checkedInCount} of {clients.length} present today
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customers assigned exclusively to you for training, workout guidance, and attendance follow-ups.
            </p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <LuSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email, or phone..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filtered.length} of {clients.length} clients
        </span>
      </div>

      {/* Clients Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Today&apos;s Attendance ({todayDateStr})</th>
                <th className="px-6 py-4">Membership Plan</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    {search ? "No clients match your search query." : "No clients assigned yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  let validityText = "—";
                  if (c.status === "TRIAL" && c.trialEndsAt) {
                    validityText = `Trial ends ${format(new Date(c.trialEndsAt), "dd MMM yyyy")}`;
                  } else if (c.membershipEnd) {
                    validityText = `Valid until ${format(new Date(c.membershipEnd), "dd MMM yyyy")}`;
                  }

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <LuMail className="h-3 w-3 shrink-0" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
                            <LuPhone className="h-3 w-3 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {c.checkedInToday ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                            <LuCalendarCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>
                              Present ({c.checkInTime ? format(new Date(c.checkInTime), "hh:mm a") : "Logged"})
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                            <LuClock className="h-3.5 w-3.5 text-slate-500" />
                            <span>Not Checked In</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium text-xs text-foreground">
                        {c.planName}
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {validityText}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={c.status} label={c.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

