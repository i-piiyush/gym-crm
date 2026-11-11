"use client";

import { useState } from "react";
import { TrainerListItem, TrainerOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { removePersonAction } from "@/actions/person.actions";
import { toast } from "sonner";
import { LuTrash2, LuUserCheck } from "react-icons/lu";

interface TrainersTableProps {
  trainers: TrainerListItem[];
  allTrainers: TrainerOption[];
}

export function TrainersTable({ trainers: initialTrainers, allTrainers }: TrainersTableProps) {
  const [trainers, setTrainers] = useState<TrainerListItem[]>(initialTrainers);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerListItem | null>(null);
  const [reassignedTrainerId, setReassignedTrainerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableReplacementTrainers = allTrainers.filter(
    (t) => t.id !== selectedTrainer?.id
  );

  const handleRemove = async () => {
    if (!selectedTrainer) return;

    if (
      selectedTrainer.assignedCustomersCount > 0 &&
      !reassignedTrainerId
    ) {
      toast.error("Please choose a replacement trainer for the assigned customers.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await removePersonAction({
        userId: selectedTrainer.id,
        reassignedTrainerId: reassignedTrainerId || undefined,
      });

      if (res.success) {
        toast.success(`Trainer ${selectedTrainer.name} removed successfully.`);
        setTrainers((prev) => prev.filter((t) => t.id !== selectedTrainer.id));
        setSelectedTrainer(null);
        setReassignedTrainerId("");
      } else {
        toast.error(res.error || "Failed to remove trainer.");
      }
    } catch {
      toast.error("An error occurred while removing the trainer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4">Trainer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Compensation</th>
              <th className="px-6 py-4">Assigned Clients</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trainers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No trainers enrolled yet. Click &quot;Add Person&quot; to invite a trainer.
                </td>
              </tr>
            ) : (
              trainers.map((trainer) => (
                <tr
                  key={trainer.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{trainer.name}</div>
                    <div className="text-xs text-muted-foreground">{trainer.email}</div>
                  </td>

                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                    {trainer.phone || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-xs text-foreground">
                      ₹{trainer.monthlySalary.toLocaleString("en-IN")} / mo
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Due on day {trainer.salaryDueDay}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <LuUserCheck className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-xs text-foreground">
                        {trainer.assignedCustomersCount} members
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={trainer.status} />
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedTrainer(trainer);
                        setReassignedTrainerId(
                          availableReplacementTrainers[0]?.id || ""
                        );
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Trainer"
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

      {/* Remove Trainer / Forced Reassignment Dialog */}
      {selectedTrainer && (
        <ConfirmDialog
          isOpen={true}
          title={`Remove Trainer: ${selectedTrainer.name}`}
          description={
            selectedTrainer.assignedCustomersCount > 0
              ? `This trainer currently manages ${selectedTrainer.assignedCustomersCount} active customer(s). Business rules require reassigning these customers to another trainer before removal.`
              : `Are you sure you want to remove ${selectedTrainer.name}? This will revoke their platform access.`
          }
          confirmLabel={
            selectedTrainer.assignedCustomersCount > 0
              ? "Reassign & Remove"
              : "Remove Trainer"
          }
          variant="destructive"
          isLoading={isLoading}
          onConfirm={handleRemove}
          onCancel={() => {
            setSelectedTrainer(null);
            setReassignedTrainerId("");
          }}
        >
          {selectedTrainer.assignedCustomersCount > 0 && (
            <div className="mt-3 space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Reassign {selectedTrainer.assignedCustomersCount} customer(s) to:
              </label>
              {availableReplacementTrainers.length === 0 ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                  No other active trainers available. Please add another trainer first before removing this one.
                </div>
              ) : (
                <select
                  value={reassignedTrainerId}
                  onChange={(e) => setReassignedTrainerId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select replacement trainer</option>
                  {availableReplacementTrainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}

