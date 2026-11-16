"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPersonSchema, AddPersonInput } from "@/schemas/person.schema";
import { addPersonAction } from "@/actions/person.actions";
import { PhoneInput } from "@/components/shared/PhoneInput";
import { PressableButton } from "@/components/motion/PressableButton";
import { TrainerOption, PlanOption } from "@/types/person.types";
import { toast } from "sonner";
import {
  X as LuX,
  UserPlus as LuUserPlus,
  ShieldAlert as LuShieldAlert,
} from "lucide-react";

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trainerOptions?: TrainerOption[];
  trainers?: TrainerOption[];
  plans: PlanOption[];
  isAtCapacity: boolean;
  capacityText?: string;
  capacity?: {
    activeCount: number;
    pendingInvites: number;
    totalCount: number;
    maxCustomers: number;
    isAtCapacity: boolean;
    gymName: string;
  };
}

export function AddPersonDialog({
  isOpen,
  onClose,
  trainerOptions: rawOptions,
  trainers: rawTrainers,
  plans,
  isAtCapacity,
  capacityText: rawCapText,
  capacity,
}: AddPersonDialogProps) {
  const trainerOptions = rawOptions || rawTrainers || [];
  const capacityText =
    rawCapText ||
    (capacity ? `${capacity.totalCount}/${capacity.maxCustomers}` : "");
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "TRAINER">(
    "CUSTOMER",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
      holidayDeductionPerDay: 0,
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
      toast.error(
        `Gym capacity limit reached (${capacityText}). Cannot add customer.`,
      );
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await addPersonAction(data);
      if (res.success) {
        toast.success(
          `Invitation sent to ${data.name} (${data.email}) as a ${data.role.toLowerCase()}!`,
        );
        router.refresh();
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
        onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
      >
        <DialogTitle className="pr-7">Add a member or coach</DialogTitle>
        <DialogDescription>
          Send an invitation to join your gym.
        </DialogDescription>
        {/* Role Toggle */}
        <div className="mt-5 flex rounded-xl bg-muted p-1  border border-border">
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleRoleChange("CUSTOMER")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              selectedRole === "CUSTOMER"
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleRoleChange("TRAINER")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              selectedRole === "TRAINER"
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trainer
          </Button>
        </div>

        {/* Capacity Alert if at limit for customers */}
        {selectedRole === "CUSTOMER" && isAtCapacity && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-status-danger-bg p-3 text-xs text-status-danger-fg   ">
            <LuShieldAlert className="h-5 w-5 shrink-0 text-status-danger-fg" />
            <div>
              <span className="font-semibold">
                Gym Capacity Reached ({capacityText})
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                This gym has reached its customer limit. The Add Customer button
                is disabled.
              </p>
            </div>
          </div>
        )}

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 space-y-4"
        >
          <input type="hidden" {...register("role")} />

          {/* Name & Email */}
          <div>
            <label
              htmlFor="register-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              id="register-name"
              {...register("name")}
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p
                id="register-name-error"
                role="alert"
                className="mt-1 text-xs text-destructive"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
              id="register-email"
              {...register("email")}
              type="email"
              placeholder="e.g. rahul.sharma@example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.email && (
              <p
                id="register-email-error"
                role="alert"
                className="mt-1 text-xs text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-phone"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Contact Phone (Optional)
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="register-phone"
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                />
              )}
            />
          </div>

          {/* TRAINER SPECIFIC FIELDS */}
          {selectedRole === "TRAINER" && (
            <div className="grid gap-3.5 sm:grid-cols-2 rounded-xl border border-border bg-muted/60 p-3.5 ">
              <div>
                <label
                  htmlFor="register-monthlySalary"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Monthly Salary (₹) <span className="text-destructive">*</span>
                </label>
                <Input
                  aria-invalid={!!errors.monthlySalary}
                  aria-describedby={
                    errors.monthlySalary
                      ? "register-monthlySalary-error"
                      : undefined
                  }
                  id="register-monthlySalary"
                  {...register("monthlySalary", { valueAsNumber: true })}
                  type="number"
                  placeholder="35000"
                  min={0}
                  max={99999999.99}
                  step="0.01"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.monthlySalary && (
                  <p
                    id="register-monthlySalary-error"
                    role="alert"
                    className="mt-1 text-xs text-destructive"
                  >
                    {errors.monthlySalary.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-salaryDueDay"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Salary Due Day of Month
                </label>
                <Input
                  aria-invalid={!!errors.salaryDueDay}
                  aria-describedby={
                    errors.salaryDueDay
                      ? "register-salaryDueDay-error"
                      : undefined
                  }
                  id="register-salaryDueDay"
                  {...register("salaryDueDay", { valueAsNumber: true })}
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={28}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Day 1 to 28
                </p>
                {errors.salaryDueDay && (
                  <p
                    id="register-salaryDueDay-error"
                    role="alert"
                    className="mt-1 text-xs text-destructive"
                  >
                    {errors.salaryDueDay.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="register-holiday-rate" className="mb-1 block text-sm font-medium text-foreground">Deduction per day without a check-in (₹)</label>
                <Input id="register-holiday-rate" type="number" min={0} max={99999999.99} step="0.01" {...register("holidayDeductionPerDay", { valueAsNumber: true })} aria-invalid={!!errors.holidayDeductionPerDay} aria-describedby={errors.holidayDeductionPerDay ? "register-holiday-rate-error" : "register-holiday-rate-help"} />
                <p id="register-holiday-rate-help" className="mt-1 text-xs text-muted-foreground">₹0 disables deductions. Paid leave is excluded; only completed days are counted.</p>
                {errors.holidayDeductionPerDay && <p id="register-holiday-rate-error" role="alert" className="mt-1 text-xs text-destructive">{errors.holidayDeductionPerDay.message}</p>}
              </div>
            </div>
          )}

          {/* CUSTOMER SPECIFIC FIELDS */}
          {selectedRole === "CUSTOMER" && (
            <div className="space-y-3.5 rounded-xl border border-border bg-muted/60 p-3.5 ">
              {/* Mandatory Trainer Selection */}
              <div>
                <label
                  htmlFor="register-trainerId"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Assigned Trainer <span className="text-destructive">*</span>
                </label>
                {trainerOptions.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-status-warning-bg p-2.5 text-xs text-status-warning-fg">
                    No active trainers in this gym. Add a trainer before
                    enrolling customers.
                  </div>
                ) : (
                  <Controller
                    name="trainerId"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        id="register-trainerId"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.trainerId}
                        aria-describedby={errors.trainerId ? "register-trainerId-error" : undefined}
                        placeholder="Select an active trainer"
                        searchPlaceholder="Search trainers…"
                        emptyMessage="No trainers found."
                        options={[
                          { value: "", label: "Select an active trainer" },
                          ...trainerOptions.map((trainer) => ({
                            value: trainer.id,
                            label: `${trainer.name} (${trainer.email})`,
                          })),
                        ]}
                      />
                    )}
                  />
                )}
                {errors.trainerId && (
                  <p
                    id="register-trainerId-error"
                    role="alert"
                    className="mt-1 text-xs text-destructive"
                  >
                    {errors.trainerId.message}
                  </p>
                )}
              </div>

              {/* Free Trial Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  {...register("isTrial")}
                  type="checkbox"
                  aria-invalid={!!errors.isTrial}
                  aria-describedby={
                    errors.isTrial ? "isTrialToggle-error" : undefined
                  }
                  id="isTrialToggle"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-foreground cursor-pointer">
                  Start customer with a free trial period
                </label>
              </div>

              {isTrial ? (
                <div>
                  <label
                    htmlFor="register-trialDays"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Trial Duration (Days)
                  </label>
                  <Input
                    aria-invalid={!!errors.trialDays}
                    aria-describedby={
                      errors.trialDays ? "register-trialDays-error" : undefined
                    }
                    id="register-trialDays"
                    {...register("trialDays", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={7}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Trial expiration will be automatically computed and flipped
                    to EXPIRED by cron.
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="register-planId"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Initial Membership Plan (Optional)
                  </label>
                  <Controller
                    name="planId"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        id="register-planId"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.planId}
                        aria-describedby={errors.planId ? "register-planId-error" : undefined}
                        placeholder="Select a membership plan"
                        searchPlaceholder="Search membership plans…"
                        emptyMessage="No membership plans found."
                        options={[
                          { value: "", label: "No initial membership plan" },
                          ...plans.map((plan) => ({
                            value: plan.id,
                            label: `${plan.name} (${plan.durationDays} days) — ₹${plan.price.toLocaleString("en-IN")}`,
                          })),
                        ]}
                      />
                    )}
                  />
                </div>
              )}

              {/* Email Receipt Checkbox */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <input
                  {...register("emailReceipt")}
                  type="checkbox"
                  aria-invalid={!!errors.emailReceipt}
                  aria-describedby={
                    errors.emailReceipt ? "emailReceiptToggle-error" : undefined
                  }
                  id="emailReceiptToggle"
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label className="text-xs text-muted-foreground cursor-pointer">
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
                ? "Sending invitation…"
                : selectedRole === "CUSTOMER" && isAtCapacity
                  ? "Capacity Limit Reached"
                  : `Send ${selectedRole.toLowerCase()} invitation`}
            </PressableButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
