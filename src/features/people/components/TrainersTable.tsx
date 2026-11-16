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
import { Combobox } from "@/components/ui/combobox";

import { useEffect, useState } from "react";
import { TrainerLeaveDialog } from "./TrainerLeaveDialog";
import { HolidayRateDialog } from "@/features/salaries/components/HolidayRateDialog";
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

export function TrainersTable({
  trainers: initialTrainers,
  allTrainers,
}: TrainersTableProps) {
  const [trainers, setTrainers] = useState<TrainerListItem[]>(initialTrainers);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerListItem | null>(null);
  const [reassignedTrainerId, setReassignedTrainerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leaveTrainer, setLeaveTrainer] = useState<TrainerListItem | null>(null);
  const [rateTrainer, setRateTrainer] = useState<TrainerListItem | null>(null);
  useEffect(() => { setTrainers(initialTrainers); }, [initialTrainers]);

  const availableReplacementTrainers = allTrainers.filter(
    (t) => t.id !== selectedTrainer?.id,
  );

  const handleRemove = async () => {
    if (!selectedTrainer) return;

    if (selectedTrainer.assignedCustomersCount > 0 && !reassignedTrainerId) {
      toast.error(
        "Please choose a replacement trainer for the assigned customers.",
      );
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
        <Table className="w-full text-left text-xs">
          <TableHeader className="border-b border-border bg-background text-[11px] font-medium text-muted-foreground">
            <TableRow>
              <TableHead className="px-5 py-3.5">Trainer Staff</TableHead>
              <TableHead className="px-5 py-3.5">Contact</TableHead>
              <TableHead className="px-5 py-3.5">Compensation</TableHead>
              <TableHead className="px-5 py-3.5">Assigned Clients</TableHead>
              <TableHead className="px-5 py-3.5">Status</TableHead>
              <TableHead className="px-5 py-3.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[rgba(40,40,40,0.05)]">
            {trainers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No trainers enrolled yet. Click &quot;Add Member or
                  Staff&quot; to invite a coach.
                </TableCell>
              </TableRow>
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
                  <TableRow
                    key={trainer.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-honeydew/60 text-xs font-semibold text-foreground">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {trainer.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {trainer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-3.5 text-xs font-mono text-muted-foreground">
                      {trainer.phone || "—"}
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <div className="font-semibold text-xs text-foreground font-mono tabular-nums">
                        ₹{trainer.monthlySalary.toLocaleString("en-IN")} / mo
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Due day {trainer.salaryDueDay} of month
                      </div>
                      <Button variant="link" size="sm" type="button" className="h-auto px-0 py-1 text-xs" onClick={() => setRateTrainer(trainer)}>
                        ₹{trainer.holidayDeductionPerDay.toLocaleString("en-IN")} / missed day · Edit
                      </Button>
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold">
                          {trainer.assignedCustomersCount}
                        </span>
                        <span className="text-muted-foreground">members</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-3.5">
                      <StatusBadge status={trainer.status} />
                    </TableCell>

                    <TableCell className="px-5 py-3.5 text-right">
                      <Button variant="outline" size="sm" type="button" className="mr-2" onClick={() => setLeaveTrainer(trainer)}>Manage leave</Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setSelectedTrainer(trainer)}
                        className="apple-button-press inline-flex h-7 w-7 items-center justify-center rounded-lg text-status-danger-fg hover:bg-status-danger-bg hover:text-status-danger-fg"
                        title="Remove Trainer"
                        aria-label={`Remove ${trainer.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {leaveTrainer && <TrainerLeaveDialog trainer={leaveTrainer} onClose={() => setLeaveTrainer(null)} />}
      {rateTrainer && <HolidayRateDialog trainerId={rateTrainer.id} trainerName={rateTrainer.name} rate={rateTrainer.holidayDeductionPerDay} onClose={() => setRateTrainer(null)} />}

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
              <label htmlFor="replacement-trainer" className="block text-xs font-medium text-foreground mb-1.5">
                Transfer {selectedTrainer.assignedCustomersCount} Clients To:
              </label>
              {availableReplacementTrainers.length === 0 ? (
                <p className="text-xs text-status-danger-fg font-medium">
                  No other active trainers available. Please add another trainer
                  first before removing this coach.
                </p>
              ) : (
                <Combobox
                  id="replacement-trainer"
                  value={reassignedTrainerId}
                  onValueChange={setReassignedTrainerId}
                  disabled={isLoading}
                  placeholder="Select replacement trainer…"
                  searchPlaceholder="Search trainers…"
                  emptyMessage="No trainers found."
                  options={[
                    { value: "", label: "Select replacement trainer…" },
                    ...availableReplacementTrainers.map((trainer) => ({
                      value: trainer.id,
                      label: `${trainer.name} (${trainer.email})`,
                    })),
                  ]}
                  className="text-xs"
                />
              )}
            </div>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
