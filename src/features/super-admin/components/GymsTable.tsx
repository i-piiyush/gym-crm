"use client";

import { useState } from "react";
import Link from "next/link";
import { GymListItem } from "@/types/gym.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  toggleGymStatusAction,
  resendOwnerInviteAction,
  revokeOwnerInviteAction,
} from "@/actions/gym.actions";
import { toast } from "sonner";
import {
  LuSquarePen,
  LuExternalLink,
  LuMailCheck,
  LuUserX,
  LuBan,
  LuCircleCheck,
} from "react-icons/lu";

interface GymsTableProps {
  gyms: GymListItem[];
}

export function GymsTable({ gyms: initialGyms }: GymsTableProps) {
  const [gyms, setGyms] = useState<GymListItem[]>(initialGyms);
  const [pendingAction, setPendingAction] = useState<{
    type: "TOGGLE_STATUS" | "REVOKE_INVITE";
    gym: GymListItem;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async (gym: GymListItem) => {
    const nextStatus = gym.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setIsLoading(true);
    try {
      const res = await toggleGymStatusAction({
        gymId: gym.id,
        status: nextStatus,
      });
      if (res.success) {
        setGyms((prev) =>
          prev.map((g) => (g.id === gym.id ? { ...g, status: nextStatus } : g))
        );
        toast.success(`Gym "${gym.name}" is now ${nextStatus.toLowerCase()}.`);
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Failed to toggle gym status.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const handleResendInvite = async (gym: GymListItem) => {
    if (!gym.pendingOwnerEmail) return;
    toast.info(`Sending invitation to ${gym.pendingOwnerEmail}...`);
    const res = await resendOwnerInviteAction({
      gymId: gym.id,
      email: gym.pendingOwnerEmail,
    });
    if (res.success) {
      toast.success(`Invitation resent to ${gym.pendingOwnerEmail}`);
    } else {
      toast.error(res.error || "Failed to resend invitation.");
    }
  };

  const handleRevokeInvite = async (gym: GymListItem) => {
    setIsLoading(true);
    try {
      const res = await revokeOwnerInviteAction({ gymId: gym.id });
      if (res.success) {
        setGyms((prev) =>
          prev.map((g) =>
            g.id === gym.id ? { ...g, pendingOwnerEmail: null } : g
          )
        );
        toast.success(`Revoked owner invitation for ${gym.name}.`);
      } else {
        toast.error(res.error || "Failed to revoke invitation.");
      }
    } catch {
      toast.error("Failed to revoke invitation.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4">Gym Facility</th>
              <th className="px-6 py-4">GPS Geofence</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Owner / Administrator</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {gyms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No gyms configured yet. Click &quot;Create New Gym&quot; to add one.
                </td>
              </tr>
            ) : (
              gyms.map((gym) => {
                const totalCustomers = gym.customerCount + gym.pendingCustomerInvitesCount;
                const isAtCapacity = totalCustomers >= gym.maxCustomers;

                return (
                  <tr
                    key={gym.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{gym.name}</div>
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                        {gym.address}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Prefix: <span className="font-mono">{gym.receiptPrefix}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-foreground">
                        {gym.latitude.toFixed(6)}, {gym.longitude.toFixed(6)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {gym.attendanceRadiusMeters}m radius
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${gym.latitude},${gym.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                          title="Open in Google Maps"
                        >
                          <LuExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-xs ${
                            isAtCapacity ? "text-rose-600 font-bold" : "text-foreground"
                          }`}
                        >
                          {totalCustomers} / {gym.maxCustomers}
                        </span>
                        {isAtCapacity && (
                          <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                            FULL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {gym.customerCount} active · {gym.pendingCustomerInvitesCount} invited
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {gym.owner ? (
                        <div>
                          <div className="font-medium text-foreground">{gym.owner.name}</div>
                          <div className="text-xs text-muted-foreground">{gym.owner.email}</div>
                        </div>
                      ) : gym.pendingOwnerEmail ? (
                        <div className="space-y-1.5">
                          <StatusBadge status="PENDING_OWNER" label="Owner invite pending" />
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {gym.pendingOwnerEmail}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              onClick={() => handleResendInvite(gym)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                            >
                              <LuMailCheck className="h-3 w-3" />
                              <span>Resend</span>
                            </button>
                            <span className="text-muted-foreground text-xs">·</span>
                            <button
                              onClick={() =>
                                setPendingAction({ type: "REVOKE_INVITE", gym })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                            >
                              <LuUserX className="h-3 w-3" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No owner assigned
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={gym.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/super-admin/gyms/${gym.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 transition-colors"
                          title="Edit Gym"
                        >
                          <LuSquarePen className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() =>
                            setPendingAction({ type: "TOGGLE_STATUS", gym })
                          }
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors ${
                            gym.status === "ACTIVE"
                              ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          }`}
                          title={
                            gym.status === "ACTIVE"
                              ? "Suspend Gym"
                              : "Activate Gym"
                          }
                        >
                          {gym.status === "ACTIVE" ? (
                            <LuBan className="h-4 w-4" />
                          ) : (
                            <LuCircleCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {pendingAction && (
        <ConfirmDialog
          isOpen={true}
          title={
            pendingAction.type === "TOGGLE_STATUS"
              ? `${
                  pendingAction.gym.status === "ACTIVE"
                    ? "Suspend"
                    : "Activate"
                } Gym: ${pendingAction.gym.name}`
              : `Revoke Owner Invitation for ${pendingAction.gym.name}`
          }
          description={
            pendingAction.type === "TOGGLE_STATUS"
              ? pendingAction.gym.status === "ACTIVE"
                ? "Suspending this gym will immediately prevent all trainers and customers from checking in and accessing portals."
                : "Activating this gym will restore access for all enrolled trainers and customers."
              : `Are you sure you want to revoke the pending owner invitation for ${pendingAction.gym.pendingOwnerEmail}?`
          }
          confirmLabel={
            pendingAction.type === "TOGGLE_STATUS"
              ? pendingAction.gym.status === "ACTIVE"
                ? "Suspend Gym"
                : "Activate Gym"
              : "Revoke Invite"
          }
          variant={
            pendingAction.type === "TOGGLE_STATUS" &&
            pendingAction.gym.status !== "ACTIVE"
              ? "primary"
              : "destructive"
          }
          isLoading={isLoading}
          onConfirm={() => {
            if (pendingAction.type === "TOGGLE_STATUS") {
              handleToggleStatus(pendingAction.gym);
            } else {
              handleRevokeInvite(pendingAction.gym);
            }
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
