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
  const [activeTab, setActiveTab] = useState<"CUSTOMERS" | "TRAINERS" | "INVITES">("CUSTOMERS");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);

  const capacityRatio = Math.min(100, Math.round((capacity.totalCount / capacity.maxCustomers) * 100));

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
      {/* -------------------------------------------------------------------- */}
      {/* TOP CAPACITY & STATS BANNER */}
      {/* -------------------------------------------------------------------- */}
      <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#242424] text-white shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#242424]">
                Member Directory & Staff
              </h2>
              <span className="rounded-full bg-[#d0e1d4]/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                {capacity.totalCount} / {capacity.maxCustomers} Enrolled
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#71697a]">
              {capacity.activeCount} active members, {capacity.pendingInvites} pending invitations • {capacityRatio}% facility capacity
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (capacity.isAtCapacity) {
              toast.error(
                `Customer capacity limit reached (${capacity.totalCount}/${capacity.maxCustomers}).`
              );
            }
            setIsAddOpen(true);
          }}
          className="apple-button-press inline-flex items-center justify-center gap-2 rounded-full bg-[#242424] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#383838]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add Member or Staff</span>
        </button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPLE TABS SWITCHER PILL */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(40,40,40,0.06)] pb-3">
        <div className="inline-flex rounded-full bg-stone-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMERS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "CUSTOMERS"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TRAINERS")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "TRAINERS"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Coaching Staff ({trainers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INVITES")}
            className={`apple-button-press flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-all ${
              activeTab === "INVITES"
                ? "bg-white text-[#242424] shadow-sm font-semibold"
                : "text-[#71697a] hover:text-[#242424]"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Pending Invites ({pendingInvites.length})</span>
          </button>
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
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
                <tr>
                  <th className="px-5 py-3.5">Invited Email</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
                {pendingInvites.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#71697a]">
                      No pending invitations at this time.
                    </td>
                  </tr>
                ) : (
                  pendingInvites.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-[#242424]">{inv.email}</td>
                      <td className="px-5 py-3.5 text-[#71697a] uppercase text-[11px] font-semibold">
                        {inv.role}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status="PENDING" label="Invite Pending" />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(inv.id)}
                          className="apple-button-press inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Revoke</span>
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

      {/* -------------------------------------------------------------------- */}
      {/* ADD PERSON DIALOG */}
      {/* -------------------------------------------------------------------- */}
      {isAddOpen && (
        <AddPersonDialog
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          trainers={trainerOptions}
          plans={plans}
          isAtCapacity={capacity.isAtCapacity}
          capacity={capacity}
        />
      )}
    </div>
  );
}
