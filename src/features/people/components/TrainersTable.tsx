"use client";

import { useState } from "react";
import { TrainerListItem, TrainerOption } from "@/types/person.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { removePersonAction } from "@/actions/person.actions";
import { toast } from "sonner";
import { Trash2, UserCheck, Users } from "lucide-react";

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
    <div className="apple-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[rgba(40,40,40,0.06)] bg-[#FAFAF8] text-[11px] font-medium text-[#71697a]">
            <tr>
              <th className="px-5 py-3.5">Trainer Staff</th>
              <th className="px-5 py-3.5">Contact</th>
              <th className="px-5 py-3.5">Compensation</th>
              <th className="px-5 py-3.5">Assigned Clients</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(40,40,40,0.05)]">
            {trainers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#71697a]">
                  No trainers enrolled yet. Click &quot;Add Member or Staff&quot; to invite a coach.
                </td>
              </tr>
            ) : (
              trainers.map((trainer) => {
                const initials = trainer.name
                  ? trainer.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "T";

                return (
                  <tr
                    key={trainer.id}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d0e1d4]/60 text-xs font-semibold text-[#242424]">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-[#242424]">{trainer.name}</p>
                          <p className="text-[11px] text-[#71697a]">{trainer.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-mono text-[#71697a]">
                      {trainer.phone || "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-xs text-[#242424] font-mono tabular-nums">
                        ₹{trainer.monthlySalary.toLocaleString("en-IN")} / mo
                      </div>
                      <div className="text-[11px] text-[#71697a]">
                        Due day {trainer.salaryDueDay} of month
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#242424]">
                        <Users className="h-3.5 w-3.5 text-[#71697a]" />
                        <span className="font-semibold">{trainer.assignedCustomersCount}</span>
                        <span className="text-[#71697a]">members</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={trainer.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTrainer(trainer)}
                        className="apple-button-press inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Remove Trainer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Remove Trainer Confirmation Dialog */}
      {selectedTrainer && (
        <ConfirmDialog
          isOpen={true}
          title={`Remove Trainer: ${selectedTrainer.name}`}
          description={
            selectedTrainer.assignedCustomersCount > 0
              ? `${selectedTrainer.name} currently coaches ${selectedTrainer.assignedCustomersCount} active customer(s). You must select a replacement trainer to receive their clients.`
              : `Are you sure you want to remove ${selectedTrainer.name}? Their coaching profile and payroll records will be archived.`
          }
          confirmLabel="Confirm Removal"
          variant="destructive"
          isLoading={isLoading}
          onConfirm={handleRemove}
          onCancel={() => {
            setSelectedTrainer(null);
            setReassignedTrainerId("");
          }}
        >
          {selectedTrainer.assignedCustomersCount > 0 && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#242424] mb-1.5">
                Transfer {selectedTrainer.assignedCustomersCount} Clients To:
              </label>
              {availableReplacementTrainers.length === 0 ? (
                <p className="text-xs text-rose-600 font-medium">
                  No other active trainers available. Please add another trainer first before removing this coach.
                </p>
              ) : (
                <select
                  value={reassignedTrainerId}
                  onChange={(e) => setReassignedTrainerId(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(40,40,40,0.1)] bg-white px-3 py-2 text-xs text-[#242424] focus:border-[#242424] focus:outline-none"
                >
                  <option value="">Select replacement trainer...</option>
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
