"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserRound,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordPaymentDialog } from "@/features/payments/components/RecordPaymentDialog";
import { PlanOption } from "@/types/person.types";
interface MemberData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  joined: string;
  status: string;
  planName: string;
  trainerName: string;
  start: string | null;
  end: string | null;
  payments: {
    id: string;
    receipt: string;
    amount: number;
    status: string;
    plan: string;
    date: string;
  }[];
  attendance: { id: string; time: string; flagged: boolean }[];
}
export function MemberProfile({
  member,
  plans,
  timezone,
}: {
  member: MemberData;
  plans: PlanOption[];
  timezone: string;
}) {
  const [renew, setRenew] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (params.get("renew") === "true") setRenew(true);
  }, [params]);
  const date = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: timezone,
        })
      : "—";
  return (
    <div className="space-y-7">
      <Link
        href="/admin/people"
        className="inline-flex items-center gap-2 text-xs text-dim hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to members
      </Link>
      <div className="flex flex-wrap items-center gap-5">
        <span className="flex size-20 items-center justify-center rounded-full bg-honeydew/60 text-2xl font-medium">
          {member.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-semibold tracking-[-1px]">
              {member.name}
            </h1>
            <StatusBadge status={member.status} />
          </div>
          <p className="mt-2 text-sm text-dim">
            Part of your community since {date(member.joined)}
          </p>
        </div>
        <Button onClick={() => setRenew(true)} disabled={!plans.length}>
          <CreditCard />
          Renew membership
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-5">
          <section className="apple-card p-6">
            <h2 className="text-[15px] font-semibold">Contact information</h2>
            <a
              href={`mailto:${member.email}`}
              className="mt-5 flex items-center gap-3 break-all text-sm text-dim"
            >
              <Mail className="size-4 shrink-0" />
              {member.email}
            </a>
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="mt-4 flex items-center gap-3 text-sm text-dim"
              >
                <Phone className="size-4" />
                {member.phone}
              </a>
            )}
          </section>
          <section className="apple-card p-6">
            <h2 className="text-[15px] font-semibold">Membership details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Plan", member.planName],
                ["Coach", member.trainerName],
                ["Started", date(member.start)],
                ["Expires", date(member.end)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-dim">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
        <section className="min-w-0">
          <Tabs defaultValue="payments">
            <TabsList>
              <TabsTrigger value="payments">Payment history</TabsTrigger>
              <TabsTrigger value="attendance">Attendance history</TabsTrigger>
            </TabsList>
            <TabsContent value="payments">
              <div className="apple-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="w-full text-left text-sm">
                    <TableHeader className="border-b border-border bg-muted/40 text-xs text-dim">
                      <TableRow>
                        {["Receipt", "Plan", "Amount", "Date", "Status"].map(
                          (h) => (
                            <TableHead key={h} className="px-4 py-4">
                              {h}
                            </TableHead>
                          ),
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                      {member.payments.length ? (
                        member.payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="whitespace-nowrap px-4 py-4 text-xs">
                              {p.receipt}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-xs">
                              {p.plan}
                            </TableCell>
                            <TableCell className="whitespace-nowrap px-4 py-4 text-sm font-medium tabular-nums">
                              ₹{p.amount.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="whitespace-nowrap px-4 py-4 text-xs text-dim">
                              {date(p.date)}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <StatusBadge status={p.status} />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="p-12 text-center text-sm text-dim"
                          >
                            No payments recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className="border-t border-border p-4 text-xs text-dim">
                  Showing the latest 50 payments.{" "}
                  <Link
                    href="/admin/payments"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Manage receipts →
                  </Link>
                </p>
              </div>
            </TabsContent>
            <TabsContent value="attendance">
              <div className="apple-card overflow-hidden">
                <Table className="w-full text-left text-sm">
                  <TableHeader className="border-b border-border bg-muted/40 text-xs text-dim">
                    <TableRow>
                      <TableHead className="px-5 py-4">Date</TableHead>
                      <TableHead className="px-5 py-4">Check-in</TableHead>
                      <TableHead className="px-5 py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {member.attendance.length ? (
                      member.attendance.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="px-5 py-4">
                            {date(a.time)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-dim">
                            {new Date(a.time).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: timezone,
                            })}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <StatusBadge
                              status={a.flagged ? "FAILED" : "VERIFIED"}
                              label={a.flagged ? "Flagged" : "Verified"}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="p-12 text-center text-sm text-dim"
                        >
                          No check-ins recorded yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <p className="border-t border-border p-4 text-xs text-dim">
                  Showing the latest 30 check-ins.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
      {renew && (
        <RecordPaymentDialog
          isOpen={renew}
          onClose={() => {
            setRenew(false);
            if (params.get("renew"))
              router.replace(`/admin/people/${member.id}`, { scroll: false });
          }}
          customers={[
            {
              id: member.id,
              name: member.name,
              email: member.email,
              currentPlanName: member.planName,
              membershipEnd: member.end ? new Date(member.end) : null,
            },
          ]}
          plans={plans}
        />
      )}
    </div>
  );
}
