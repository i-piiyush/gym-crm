"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { useState } from "react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Search as LuSearch,
  CalendarCheck as LuCalendarCheck,
  Clock as LuClock,
  User as LuUser,
  Phone as LuPhone,
  Mail as LuMail,
} from "lucide-react";

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
              <h2 className="text-base font-semibold text-foreground">
                My Coaching Clients
              </h2>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-status-active-bg px-2.5 py-0.5 text-xs font-semibold text-status-active-fg   ">
                {checkedInCount} of {clients.length} present today
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customers assigned exclusively to you for training, workout
              guidance, and attendance follow-ups.
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
          <Table className="w-full text-left text-sm">
            <TableHeader className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground ">
              <TableRow>
                <TableHead className="px-6 py-4">Client</TableHead>
                <TableHead className="px-6 py-4">
                  Today&apos;s Attendance ({todayDateStr})
                </TableHead>
                <TableHead className="px-6 py-4">Membership Plan</TableHead>
                <TableHead className="px-6 py-4">Validity</TableHead>
                <TableHead className="px-6 py-4 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground text-xs"
                  >
                    {search
                      ? "No clients match your search query."
                      : "No clients assigned yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => {
                  let validityText = "—";
                  if (c.status === "TRIAL" && c.trialEndsAt) {
                    validityText = `Trial ends ${format(new Date(c.trialEndsAt), "dd MMM yyyy")}`;
                  } else if (c.membershipEnd) {
                    validityText = `Valid until ${format(new Date(c.membershipEnd), "dd MMM yyyy")}`;
                  }

                  return (
                    <TableRow
                      key={c.id}
                      className="hover:bg-muted/30  transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="font-semibold text-foreground">
                          {c.name}
                        </div>
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
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        {c.checkedInToday ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-status-active-bg border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-status-active-fg   ">
                            <LuCalendarCheck className="h-3.5 w-3.5 text-emerald-600 " />
                            <span>
                              Present (
                              {c.checkInTime
                                ? format(new Date(c.checkInTime), "hh:mm a")
                                : "Logged"}
                              )
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-medium text-dim   ">
                            <LuClock className="h-3.5 w-3.5 text-dim" />
                            <span>Not Checked In</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 font-medium text-xs text-foreground">
                        {c.planName}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                        {validityText}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <StatusBadge status={c.status} label={c.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
