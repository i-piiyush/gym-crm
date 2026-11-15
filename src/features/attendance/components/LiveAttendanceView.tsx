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

import { useState, useCallback, useRef, useEffect } from "react";
import { usePolling } from "@/hooks/use-polling";
import {
  AttendanceRecordView,
  MonthlyAttendanceSummary,
} from "@/types/attendance.types";
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
  const [records, setRecords] =
    useState<AttendanceRecordView[]>(initialRecords);
  const [selectedRole, setSelectedRole] = useState<
    "ALL" | "TRAINER" | "CUSTOMER"
  >("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const [pollError, setPollError] = useState("");
  const requestId = useRef(0);
  const prevIdsRef = useRef<Set<string>>(
    new Set(initialRecords.map((r) => r.id)),
  );

  // Polling function: runs every 10 seconds
  const fetchLiveRecords = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const url = `/api/attendance/today?gymId=${gymId}&date=${selectedDate}${
        selectedRole !== "ALL" ? `&role=${selectedRole}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not refresh attendance.");
      if (res.ok) {
        const data = await res.json();
        if (id !== requestId.current) return;
        setPollError("");
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
      if (id === requestId.current)
        setPollError(
          "Could not refresh attendance. Showing the last loaded records.",
        );
    }
  }, [gymId, selectedDate, selectedRole]);

  useEffect(() => {
    void fetchLiveRecords();
  }, [fetchLiveRecords]);

  // Hook runs every 10s when tab is visible
  usePolling(fetchLiveRecords, 10000, activeTab === "LIVE");

  const filteredRecords = records.filter(
    (r) =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {pollError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-desert/70 bg-desert/15 p-4 text-xs text-status-warning-fg"
        >
          {pollError}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchLiveRecords()}
          >
            Retry
          </Button>
        </div>
      )}
      {/* -------------------------------------------------------------------- */}
      {/* TOP LIVE STATUS BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Radio className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-honeydew opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-status-active-bg0"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Attendance at a glance
              </h2>
              <span className="rounded-full bg-honeydew/50 px-2.5 py-0.5 text-xs font-semibold text-status-active-fg">
                {records.length} checked in today
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Verified check-ins · Refreshes every 10 seconds (Updated{" "}
              {format(lastUpdated, "hh:mm:ss a")})
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TABS SWITCHER PILL */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg bg-muted p-1 text-xs">
          <Button
            type="button"
            onClick={() => setActiveTab("LIVE")}
            className={`apple-button-press flex flex-wrap items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "LIVE"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Live Check-Ins ({records.length})</span>
          </Button>

          <Button
            type="button"
            onClick={() => setActiveTab("MONTHLY")}
            className={`apple-button-press flex flex-wrap items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "MONTHLY"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Monthly Consistency ({monthlySummaries.length})</span>
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* LIVE ATTENDANCE TABLE */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "LIVE" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search check-ins by name or email..."
                className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
              />

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-ring focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers Only</option>
                <option value="TRAINER">Trainers Only</option>
              </select>
            </div>
          </div>

          <div className="apple-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-left text-xs">
                <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-5 py-3.5">
                      Member or coach
                    </TableHead>
                    <TableHead className="px-5 py-3.5">Role</TableHead>
                    <TableHead className="px-5 py-3.5">
                      Check-In Timestamp
                    </TableHead>
                    <TableHead className="px-5 py-3.5">Distance</TableHead>
                    <TableHead className="px-5 py-3.5 text-right">
                      Verification
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
                  <AnimatePresence>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          {search
                            ? "No attendance records match your search."
                            : "No check-ins logged for this date yet."}
                        </TableCell>
                      </TableRow>
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
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="px-5 py-3.5">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-semibold text-foreground">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {r.userName}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {r.userEmail}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="px-5 py-3.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  r.userRole === "TRAINER"
                                    ? "bg-honeydew/60 text-status-active-fg"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {r.userRole}
                              </span>
                            </TableCell>

                            <TableCell className="px-5 py-3.5 text-xs text-foreground">
                              <div className="flex items-center gap-1.5 font-medium font-mono text-[11px]">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>
                                  {format(new Date(r.checkInAt), "hh:mm a")}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {r.date}
                              </span>
                            </TableCell>

                            <TableCell className="px-5 py-3.5 font-mono text-xs">
                              <span className="font-semibold text-foreground">
                                {r.distanceMeters}m away
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                GPS Accuracy: ±{Math.round(r.accuracyMeters)}m
                              </p>
                            </TableCell>

                            <TableCell className="px-5 py-3.5 text-right">
                              {r.flagged ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-danger-fg bg-status-danger-bg px-2 py-0.5 rounded-full">
                                  Flagged
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-active-fg bg-honeydew/50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Verified Present</span>
                                </span>
                              )}
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
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
            <Table className="w-full text-left text-xs">
              <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
                <TableRow>
                  <TableHead className="px-5 py-3.5">Member or coach</TableHead>
                  <TableHead className="px-5 py-3.5">Role</TableHead>
                  <TableHead className="px-5 py-3.5">
                    Days Present This Month
                  </TableHead>
                  <TableHead className="px-5 py-3.5">
                    Monthly Consistency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
                {monthlySummaries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No attendance data recorded this month.
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlySummaries.map((s) => (
                    <TableRow
                      key={s.userId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5 font-semibold text-foreground">
                        {s.userName}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                          {s.userRole}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs font-mono text-foreground">
                        <span className="font-semibold">{s.daysPresent}</span> /{" "}
                        {s.totalDaysInMonth} days
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#71697a]"
                              style={{ width: `${s.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground font-mono tabular-nums">
                            {s.attendancePercentage}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
