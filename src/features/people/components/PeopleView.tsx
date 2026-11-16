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
import {
  CustomerListItem,
  TrainerListItem,
  TrainerOption,
  PlanOption,
  PendingInviteItem,
} from "@/types/person.types";
import { CustomersTable } from "./CustomersTable";
import { TrainersTable } from "./TrainersTable";
import { AddPersonDialog } from "./AddPersonDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { revokeInviteAction } from "@/actions/person.actions";
import { toast } from "sonner";
import {
  Users,
  Dumbbell,
  Mail,
  UserPlus,
  Trash2,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface PeopleViewProps {
  trainers: TrainerListItem[];
  customers: CustomerListItem[];
  capacity: {
    activeCount: number;
    pendingInvites: number;
    totalCount: number;
    maxCustomers: number;
    isAtCapacity: boolean;
    gymName: string;
  };
  trainerOptions: TrainerOption[];
  plans: PlanOption[];
  pendingInvites: PendingInviteItem[];
}

export function PeopleView({
  trainers,
  customers,
  capacity,
  trainerOptions,
  plans,
  pendingInvites: initialPendingInvites,
}: PeopleViewProps) {
  const [activeTab, setActiveTab] = useState<
    "CUSTOMERS" | "TRAINERS" | "INVITES"
  >("CUSTOMERS");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);

  const params = useSearchParams();
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeBusy, setRevokeBusy] = useState(false);
  useEffect(() => {
    if (params.get("add") === "true") setIsAddOpen(true);
  }, [params]);
  useEffect(() => {
    setPendingInvites(initialPendingInvites);
  }, [initialPendingInvites]);
  const capacityRatio = Math.min(
    100,
    Math.round((capacity.totalCount / capacity.maxCustomers) * 100),
  );

  const handleRevokeInvite = async (invitationId: string) => {
    if (revokeBusy) return;
    setRevokeBusy(true);
    try {
      const res = await revokeInviteAction({ invitationId });
      if (res.success) {
        toast.success("Invitation revoked.");
        setPendingInvites((prev) => prev.filter((i) => i.id !== invitationId));
        setRevoking(null);
      } else {
        toast.error(res.error || "Failed to revoke invitation.");
      }
    } catch {
      toast.error("Failed to revoke invitation.");
    } finally {
      setRevokeBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* TOP CAPACITY & STATS BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Your community
              </h2>
              <span className="rounded-full bg-honeydew/50 px-2.5 py-0.5 text-xs font-semibold text-status-active-fg">
                {capacity.totalCount} / {capacity.maxCustomers} Enrolled
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {capacity.activeCount} active members, {capacity.pendingInvites}{" "}
              pending invitations • {capacityRatio}% facility capacity
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => {
            if (capacity.isAtCapacity) {
              toast.error(
                `Customer capacity limit reached (${capacity.totalCount}/${capacity.maxCustomers}).`,
              );
            }
            setIsAddOpen(true);
          }}
          className="apple-button-press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/85"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add member or coach</span>
        </Button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPLE TABS SWITCHER PILL */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg bg-muted p-1 text-xs">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setActiveTab("CUSTOMERS")}
            className={`apple-button-press flex flex-wrap items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "CUSTOMERS"
                ? "bg-card text-foreground shadow-sm font-semibold hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Members ({customers.length})</span>
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={() => setActiveTab("TRAINERS")}
            className={`apple-button-press flex flex-wrap items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "TRAINERS"
                ? "bg-card text-foreground shadow-sm font-semibold hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Coaches ({trainers.length})</span>
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={() => setActiveTab("INVITES")}
            className={`apple-button-press flex flex-wrap items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "INVITES"
                ? "bg-card text-foreground shadow-sm font-semibold hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Pending Invites ({pendingInvites.length})</span>
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TAB CONTENT PANELS */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "CUSTOMERS" && (
        <CustomersTable customers={customers} trainers={trainerOptions} />
      )}

      {activeTab === "TRAINERS" && (
        <TrainersTable trainers={trainers} allTrainers={trainerOptions} />
      )}

      {activeTab === "INVITES" && (
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs">
              <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
                <TableRow>
                  <TableHead className="px-5 py-3.5">Invited Email</TableHead>
                  <TableHead className="px-5 py-3.5">Assigned Role</TableHead>
                  <TableHead className="px-5 py-3.5">Status</TableHead>
                  <TableHead className="px-5 py-3.5 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
                {pendingInvites.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No pending invitations at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingInvites.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-5 py-3.5 font-medium text-foreground">
                        {inv.email}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-muted-foreground uppercase text-[11px] font-semibold">
                        {inv.role}
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <StatusBadge status="PENDING" label="Invite Pending" />
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setRevoking(inv.id)}
                        className="apple-button-press inline-flex items-center gap-1 rounded-full border border-rose-200 bg-status-danger-bg px-2.5 py-1 text-[11px] font-medium text-status-danger-fg hover:bg-status-danger-bg hover:text-status-danger-fg"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Revoke</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* ADD PERSON DIALOG */}
      <ConfirmDialog
        isOpen={!!revoking}
        title="Revoke this invitation?"
        description="The invitation link will stop working. You can send a new invitation later."
        confirmLabel="Revoke invitation"
        isLoading={revokeBusy}
        onCancel={() => setRevoking(null)}
        onConfirm={() => revoking && handleRevokeInvite(revoking)}
      />
      {/* -------------------------------------------------------------------- */}
      {isAddOpen && (
        <AddPersonDialog
          isOpen={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            if (params.get("add"))
              router.replace("/admin/people", { scroll: false });
          }}
          trainers={trainerOptions}
          plans={plans}
          isAtCapacity={capacity.isAtCapacity}
          capacity={capacity}
        />
      )}
    </div>
  );
}
