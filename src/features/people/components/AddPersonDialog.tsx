"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPersonSchema, AddPersonInput } from "@/schemas/person.schema";
import { addPersonAction } from "@/actions/person.actions";
import { PhoneInput } from "@/components/shared/PhoneInput";
import { PressableButton } from "@/components/motion/PressableButton";
import { TrainerOption, PlanOption } from "@/types/person.types";
import { toast } from "sonner";
import { LuX, LuUserPlus, LuShieldAlert } from "react-icons/lu";

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trainerOptions: TrainerOption[];
  plans: PlanOption[];
  isAtCapacity: boolean;
  capacityText: string;
}

export function AddPersonDialog({
  isOpen,
  onClose,
  trainerOptions,
  plans,
  isAtCapacity,
  capacityText,
}: AddPersonDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "TRAINER">("CUSTOMER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddPersonInput>({
    resolver: zodResolver(addPersonSchema),
    defaultValues: {
      role: "CUSTOMER",
      name: "",
      email: "",
      phone: "",
      trainerId: trainerOptions[0]?.id || "",
      planId: plans[0]?.id || null,
      isTrial: false,
      trialDays: 7,
      emailReceipt: true,
      monthlySalary: 30000,
      salaryDueDay: 1,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const isTrial = watch("isTrial");

  const handleRoleChange = (role: "CUSTOMER" | "TRAINER") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: AddPersonInput) => {
    if (data.role === "CUSTOMER" && isAtCapacity) {
      toast.error(`Gym capacity limit reached (${capacityText}). Cannot add customer.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addPersonAction(data);
      if (res.success) {
        toast.success(
          `Invitation sent to ${data.name} (${data.email}) as a ${data.role.toLowerCase()}!`
        );
        reset();
        onClose();
      } else {
        toast.error(res.error || "Failed to add person.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-primary dark:bg-emerald-950/40">
              <LuUserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add Person to Gym</h2>
              <p className="text-xs text-muted-foreground">
                Invite a trainer or customer via email.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Role Toggle */}
        <div className="mt-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-border">
          <button
            type="button"
            onClick={() => handleRoleChange("CUSTOMER")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              selectedRole === "CUSTOMER"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("TRAINER")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              selectedRole === "TRAINER"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trainer
          </button>
        </div>

        {/* Capacity Alert if at limit for customers */}
        {selectedRole === "CUSTOMER" && isAtCapacity && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
            <LuShieldAlert className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">Gym Capacity Reached ({capacityText})</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                This gym has reached its customer limit. The Add Customer button is disabled.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <input type="hidden" {...register("role")} />

          {/* Name & Email */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="e.g. rahul.sharma@example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Contact Phone (Optional)
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                />
              )}
            />
          </div>

          {/* TRAINER SPECIFIC FIELDS */}
          {selectedRole === "TRAINER" && (
            <div className="grid gap-3.5 sm:grid-cols-2 rounded-xl border border-border bg-slate-50/60 p-3.5 dark:bg-slate-900/40">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Monthly Salary (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("monthlySalary", { valueAsNumber: true })}
                  type="number"
                  placeholder="35000"
                  min={0}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.monthlySalary && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.monthlySalary.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Salary Due Day of Month
                </label>
                <input
                  {...register("salaryDueDay", { valueAsNumber: true })}
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={28}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-0.5 text-[10px] text-muted-foreground">Day 1 to 28</p>
                {errors.salaryDueDay && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.salaryDueDay.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CUSTOMER SPECIFIC FIELDS */}
          {selectedRole === "CUSTOMER" && (
            <div className="space-y-3.5 rounded-xl border border-border bg-slate-50/60 p-3.5 dark:bg-slate-900/40">
              {/* Mandatory Trainer Selection */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Assigned Trainer <span className="text-destructive">*</span>
                </label>
                {trainerOptions.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                    No active trainers in this gym. Add a trainer before enrolling customers.
                  </div>
                ) : (
                  <select
                    {...register("trainerId")}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select an active trainer</option>
                    {trainerOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                )}
                {errors.trainerId && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.trainerId.message}
                  </p>
                )}
              </div>

              {/* Free Trial Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  {...register("isTrial")}
                  type="checkbox"
                  id="isTrialToggle"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isTrialToggle"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Start customer with a free trial period
                </label>
              </div>

              {isTrial ? (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Trial Duration (Days)
                  </label>
                  <input
                    {...register("trialDays", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={7}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Trial expiration will be automatically computed and flipped to EXPIRED by cron.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Initial Membership Plan (Optional)
                  </label>
                  <select
                    {...register("planId")}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a membership plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.durationDays} days) - ₹{p.price.toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email Receipt Checkbox */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <input
                  {...register("emailReceipt")}
                  type="checkbox"
                  id="emailReceiptToggle"
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label
                  htmlFor="emailReceiptToggle"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Email receipt to customer upon enrollment (if plan is chosen)
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <PressableButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </PressableButton>
            <PressableButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={
                isSubmitting ||
                (selectedRole === "CUSTOMER" && isAtCapacity) ||
                (selectedRole === "CUSTOMER" && trainerOptions.length === 0)
              }
            >
              {isSubmitting
                ? "Sending Invitation..."
                : selectedRole === "CUSTOMER" && isAtCapacity
                ? "Capacity Limit Reached"
                : `Send ${selectedRole.toLowerCase()} invitation`}
            </PressableButton>
          </div>
        </form>
      </div>
    </div>
  );
}

