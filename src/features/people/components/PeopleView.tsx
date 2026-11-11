"use client";

import { useState } from "react";
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
import { PressableButton } from "@/components/motion/PressableButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { revokeInviteAction } from "@/actions/person.actions";
import { toast } from "sonner";
import { LuUserPlus, LuUsers, LuDumbbell, LuMailQuestion, LuTrash2 } from "react-icons/lu";

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
  const [activeTab, setActiveTab] = useState<"CUSTOMERS" | "TRAINERS" | "INVITES">("CUSTOMERS");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);

  const capacityRatio = capacity.totalCount / capacity.maxCustomers;
  const capacityBadgeColor =
    capacityRatio >= 1
      ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
      : capacityRatio >= 0.8
      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
      : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300";

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      const res = await revokeInviteAction({ invitationId });
      if (res.success) {
        toast.success("Invitation revoked.");
        setPendingInvites((prev) => prev.filter((i) => i.id !== invitationId));
      } else {
        toast.error(res.error || "Failed to revoke invitation.");
      }
    } catch {
      toast.error("Failed to revoke invitation.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action & capacity status banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LuUsers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Staff & Members
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide ${capacityBadgeColor}`}
              >
                Customers: {capacity.totalCount} / {capacity.maxCustomers}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {capacity.activeCount} active customers, {capacity.pendingInvites} pending invitations
            </p>
          </div>
        </div>

        <PressableButton
          onClick={() => {
            if (capacity.isAtCapacity) {
              toast.error(
                `Customer capacity limit reached (${capacity.totalCount}/${capacity.maxCustomers}).`
              );
            }
            setIsAddOpen(true);
          }}
          className="shrink-0 flex items-center gap-2"
        >
          <LuUserPlus className="h-4 w-4" />
          <span>Add Person</span>
        </PressableButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("CUSTOMERS")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "CUSTOMERS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuUsers className="h-4 w-4" />
          <span>Customers ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TRAINERS")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "TRAINERS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuDumbbell className="h-4 w-4" />
          <span>Trainers ({trainers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INVITES")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "INVITES"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <LuMailQuestion className="h-4 w-4" />
          <span>Pending Invitations ({pendingInvites.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "CUSTOMERS" && (
        <CustomersTable customers={customers} trainers={trainerOptions} />
      )}

      {activeTab === "TRAINERS" && (
        <TrainersTable trainers={trainers} allTrainers={trainerOptions} />
      )}

      {activeTab === "INVITES" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4">Invited Email</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingInvites.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No pending invitations at this time.
                    </td>
                  </tr>
                ) : (
                  pendingInvites.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {inv.email}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {inv.role}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status="INVITED" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevokeInvite(inv.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Revoke Invitation"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Person Modal Dialog */}
      <AddPersonDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        trainerOptions={trainerOptions}
        plans={plans}
        isAtCapacity={capacity.isAtCapacity}
        capacityText={`${capacity.totalCount}/${capacity.maxCustomers}`}
      />
    </div>
  );
}

