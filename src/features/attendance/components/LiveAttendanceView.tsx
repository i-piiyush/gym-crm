"use client";

import { useState, useCallback, useRef } from "react";
import { usePolling } from "@/hooks/use-polling";
import { AttendanceRecordView, MonthlyAttendanceSummary } from "@/types/attendance.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import {
  Radio,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

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
      {/* -------------------------------------------------------------------- */}
      {/* TOP LIVE STATUS BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#242424] text-white shadow-sm">
            <Radio className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d0e1d4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#242424]">
                Today&apos;s Attendance & Geofence Logs
              </h2>
              <span className="rounded-full bg-[#d0e1d4]/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                {records.length} checked in today
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#71697a]">
              Hardware GPS verified within gym radius • Auto-refreshes every 10s (Updated{" "}
              {format(lastUpdated, "hh:mm:ss a")})
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TABS SWITCHER PILL */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(40,40,40,0.06)] pb-3">
        <div className="inline-flex rounded-full bg-stone-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("LIVE")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "LIVE"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Live Check-Ins ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MONTHLY")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "MONTHLY"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Monthly Consistency ({monthlySummaries.length})</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* LIVE ATTENDANCE TABLE */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "LIVE" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858585]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search check-ins by name or email..."
                className="w-full rounded-full border border-[rgba(40,40,40,0.08)] bg-white pl-9 pr-4 py-1.5 text-xs text-[#242424] placeholder:text-[#858585] focus:border-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-3 py-1.5 text-xs text-[#242424] focus:border-[#242424] focus:outline-none"
              />

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-3 py-1.5 text-xs text-[#242424] focus:border-[#242424] focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers Only</option>
                <option value="TRAINER">Trainers Only</option>
              </select>
            </div>
          </div>

          <div className="apple-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
                  <tr>
                    <th className="px-5 py-3.5">Member / Staff</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Check-In Timestamp</th>
                    <th className="px-5 py-3.5">Distance from Gym</th>
                    <th className="px-5 py-3.5 text-right">Geofence Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
                  <AnimatePresence>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#71697a]">
                          {search
                            ? "No attendance records match your search."
                            : "No check-ins logged for this date yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => {
                        const isNew = r.id === newlyAddedId;
                        const initials = r.userName
                          ? r.userName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "M";

                        return (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hover:bg-stone-50/50 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f6d0] text-xs font-semibold text-[#242424]">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#242424]">{r.userName}</p>
                                  <p className="text-[11px] text-[#71697a]">{r.userEmail}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  r.userRole === "TRAINER"
                                    ? "bg-[#d0e1d4]/60 text-emerald-900"
                                    : "bg-stone-100 text-[#71697a]"
                                }`}
                              >
                                {r.userRole}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 text-xs text-[#242424]">
                              <div className="flex items-center gap-1.5 font-medium font-mono text-[11px]">
                                <Clock className="h-3.5 w-3.5 text-[#71697a]" />
                                <span>{format(new Date(r.checkInAt), "hh:mm a")}</span>
                              </div>
                              <span className="text-[10px] text-[#71697a]">{r.date}</span>
                            </td>

                            <td className="px-5 py-3.5 font-mono text-xs">
                              <span className="font-semibold text-[#242424]">
                                {r.distanceMeters}m away
                              </span>
                              <p className="text-[10px] text-[#71697a]">
                                GPS Accuracy: ±{Math.round(r.accuracyMeters)}m
                              </p>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              {r.flagged ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                  Flagged
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-[#d0e1d4]/50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Verified Present</span>
                                </span>
                              )}
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

      {/* -------------------------------------------------------------------- */}
      {/* MONTHLY SUMMARY TABLE */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "MONTHLY" && (
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
                <tr>
                  <th className="px-5 py-3.5">Member / Staff</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Days Present This Month</th>
                  <th className="px-5 py-3.5">Monthly Consistency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
                {monthlySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#71697a]">
                      No attendance data recorded this month.
                    </td>
                  </tr>
                ) : (
                  monthlySummaries.map((s) => (
                    <tr key={s.userId} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#242424]">
                        {s.userName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#71697a]">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium">
                          {s.userRole}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-[#242424]">
                        <span className="font-semibold">{s.daysPresent}</span> / {s.totalDaysInMonth} days
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-32 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#71697a]"
                              style={{ width: `${s.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-[#242424] font-mono tabular-nums">
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
