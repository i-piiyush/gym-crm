"use client";

import { useState, useCallback, useRef } from "react";
import { usePolling } from "@/hooks/use-polling";
import { AttendanceRecordView, MonthlyAttendanceSummary } from "@/types/attendance.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import {
  LuRadio,
  LuCalendar,
  LuUsers,
  LuSearch,
  LuCircleCheck,
  LuClock,
} from "react-icons/lu";

interface LiveAttendanceViewProps {
  gymId: string;
  initialRecords: AttendanceRecordView[];
  initialDate: string;
  monthlySummaries: MonthlyAttendanceSummary[];
}

export function LiveAttendanceView({
  gymId,
  initialRecords,
  initialDate,
  monthlySummaries,
}: LiveAttendanceViewProps) {
  const [activeTab, setActiveTab] = useState<"LIVE" | "MONTHLY">("LIVE");
  const [records, setRecords] = useState<AttendanceRecordView[]>(initialRecords);
  const [selectedRole, setSelectedRole] = useState<"ALL" | "TRAINER" | "CUSTOMER">("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const prevIdsRef = useRef<Set<string>>(new Set(initialRecords.map((r) => r.id)));

  // Polling function: runs every 10 seconds
  const fetchLiveRecords = useCallback(async () => {
    try {
      const url = `/api/attendance/today?gymId=${gymId}&date=${selectedDate}${
        selectedRole !== "ALL" ? `&role=${selectedRole}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const incoming: AttendanceRecordView[] = data.records || [];

        // Check for new check-in to trigger animation
        const incomingIds = new Set(incoming.map((r) => r.id));
        for (const item of incoming) {
          if (!prevIdsRef.current.has(item.id)) {
            setNewlyAddedId(item.id);
            setTimeout(() => setNewlyAddedId(null), 3000);
            break;
          }
        }
        prevIdsRef.current = incomingIds;
        setRecords(incoming);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, [gymId, selectedDate, selectedRole]);

  // Hook runs every 10s when tab is visible
  usePolling(fetchLiveRecords, 10000, activeTab === "LIVE");

  const filteredRecords = records.filter(
    (r) =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Live Polling Status Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-primary dark:bg-emerald-950/40">
            <LuRadio className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Today&apos;s Live Feed
              </h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                {records.length} checked in today
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live polling every 10 seconds without page reload · Updated {format(lastUpdated, "hh:mm:ss a")}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-border">
          <button
            onClick={() => setActiveTab("LIVE")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "LIVE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Live Feed
          </button>
          <button
            onClick={() => setActiveTab("MONTHLY")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "MONTHLY"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Summary
          </button>
        </div>
      </div>

      {activeTab === "LIVE" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role filter buttons */}
              <div className="flex rounded-lg border border-border bg-card p-1 text-xs">
                {(["ALL", "TRAINER", "CUSTOMER"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                      selectedRole === role
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {role === "ALL" ? "All Roles" : `${role.slice(0, 1)}${role.slice(1).toLowerCase()}s`}
                  </button>
                ))}
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs shadow-xs">
                <LuCalendar className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-64">
              <LuSearch className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search attendee name..."
                className="w-full rounded-lg border border-input bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4">Member / Trainer</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Check-in Time</th>
                    <th className="px-6 py-4">Proximity &amp; Accuracy</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No check-ins recorded for this selection.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => {
                        const isNew = r.id === newlyAddedId;

                        return (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              backgroundColor: isNew
                                ? "rgba(16, 185, 129, 0.15)"
                                : undefined,
                            }}
                            transition={{ duration: 0.25 }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground">
                                {r.userName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.userEmail}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-xs font-semibold">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  r.userRole === "TRAINER"
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                              >
                                {r.userRole}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-xs text-foreground">
                              <div className="flex items-center gap-1.5 font-medium">
                                <LuClock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{format(new Date(r.checkInAt), "hh:mm a")}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {r.date}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-xs">
                              <div className="font-medium text-foreground">
                                {r.distanceMeters}m away
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                GPS accuracy: ±{Math.round(r.accuracyMeters)}m
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <LuCircleCheck className="h-4 w-4" />
                                <span>Verified Present</span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "MONTHLY" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4">Person</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Days Present This Month</th>
                  <th className="px-6 py-4">Consistency Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlySummaries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No attendance data recorded this month.
                    </td>
                  </tr>
                ) : (
                  monthlySummaries.map((s) => (
                    <tr
                      key={s.userId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                    >
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {s.userName}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {s.userRole}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-bold text-foreground">
                          {s.daysPresent}
                        </span>{" "}
                        / {s.totalDaysInMonth} days
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${s.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {s.attendancePercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
