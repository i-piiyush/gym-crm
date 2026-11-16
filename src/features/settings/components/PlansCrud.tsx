"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPlanSchema,
  updatePlanSchema,
  CreatePlanInput,
  UpdatePlanInput,
} from "@/schemas/plan.schema";
import { createPlanAction, updatePlanAction } from "@/actions/plan.actions";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";

export interface PlanItem {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  isActive: boolean;
}

interface PlansCrudProps {
  initialPlans: PlanItem[];
}

export function PlansCrud({ initialPlans }: PlansCrudProps) {
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [togglingPlan, setTogglingPlan] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

  // Form for Creating Plan
  const createForm = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: "",
      durationDays: 30,
      price: 1500,
      isActive: true,
    },
  });

  // Form for Editing Plan
  const editForm = useForm<UpdatePlanInput>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      id: "",
      name: "",
      durationDays: 30,
      price: 1500,
      isActive: true,
    },
  });

  const handleOpenEdit = (plan: PlanItem) => {
    setEditingPlan(plan);
    editForm.reset({
      id: plan.id,
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      isActive: plan.isActive,
    });
  };

  const handleCreateSubmit = async (data: CreatePlanInput) => {
    try {
      const res = await createPlanAction(data);
      if (!res.success) {
        createForm.setError("root", {
          message: res.error || "Could not create this plan.",
        });
        toast.error(res.error || "Could not create this plan.");
        return;
      }
      setPlans((prev) =>
        [
          ...prev,
          {
            id: res.data.id,
            name: res.data.name,
            durationDays: res.data.durationDays,
            price: Number(res.data.price),
            isActive: res.data.isActive,
          },
        ].sort((a, b) => a.price - b.price),
      );
      toast.success("Membership plan created.");
      createForm.reset();
      setIsCreateOpen(false);
    } catch {
      createForm.setError("root", {
        message: "Could not save this plan. Please try again.",
      });
      toast.error("Could not save this plan. Please try again.");
    }
  };
  const handleEditSubmit = async (data: UpdatePlanInput) => {
    try {
      const res = await updatePlanAction(data);
      if (!res.success) {
        editForm.setError("root", {
          message: res.error || "Could not update this plan.",
        });
        toast.error(res.error || "Could not update this plan.");
        return;
      }
      setPlans((prev) =>
        prev.map((p) =>
          p.id === data.id
            ? {
                ...p,
                name: res.data.name,
                durationDays: res.data.durationDays,
                price: Number(res.data.price),
                isActive: res.data.isActive,
              }
            : p,
        ),
      );
      toast.success("Membership plan updated.");
      setEditingPlan(null);
    } catch {
      editForm.setError("root", {
        message: "Could not save this plan. Please try again.",
      });
      toast.error("Could not save this plan. Please try again.");
    }
  };
  const handleToggleActive = async (plan: PlanItem) => {
    if (togglingPlan) return;
    setTogglingPlan(plan.id);
    try {
      const res = await updatePlanAction({
        id: plan.id,
        name: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
        isActive: !plan.isActive,
      });
      if (!res.success) {
        toast.error(res.error || "Could not update plan availability.");
        return;
      }
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, isActive: !plan.isActive } : p,
        ),
      );
      toast.success(`Plan is now ${!plan.isActive ? "active" : "inactive"}.`);
    } catch {
      toast.error("Could not update plan availability. Please try again.");
    } finally {
      setTogglingPlan(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-desert/20 text-foreground">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Membership Plans
              </h2>
              <span className="rounded-full bg-surface border border-border/70 px-2 py-0.5 text-[11px] font-medium text-dim tabular-nums">
                {plans.length} configured
              </span>
            </div>
            <p className="text-xs text-dim mt-0.5">
              Configure subscription tiers, validity durations, and pricing in
              INR.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Plan</span>
        </Button>
      </div>

      {/* Plans List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-border/80 bg-background/50">
            <CreditCard className="h-8 w-8 text-dim/60 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              No membership plans configured
            </p>
            <p className="text-xs text-dim mt-1 max-w-sm mx-auto">
              Create your first plan to start enrolling members and issuing
              digital payment receipts.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Plan</span>
            </Button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                plan.isActive
                  ? "border-border/80 bg-surface hover:shadow-md hover:border-border"
                  : "border-border/50 bg-muted/60 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground tracking-tight">
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-dim mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{plan.durationDays} Days Validity</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleToggleActive(plan)}
                    disabled={!!togglingPlan}
                    title={
                      plan.isActive
                        ? "Click to deactivate"
                        : "Click to activate"
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
                      plan.isActive
                        ? "border-status-active-fg/20 bg-honeydew text-status-active-fg hover:bg-honeydew/80 hover:text-status-active-fg"
                        : "border-border bg-background text-dim"
                    }`}
                  >
                    {plan.isActive ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Inactive</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex items-baseline justify-between border-t border-border/40 pt-3.5">
                <div>
                  <span className="text-[11px] tracking-wide text-dim block font-medium">
                    Rate
                  </span>
                  <span className="font-semibold text-lg text-foreground tabular-nums">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleOpenEdit(plan)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                >
                  <Pencil className="h-3 w-3 text-dim" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Plan Dialog */}
      {isCreateOpen && (
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => !open && setIsCreateOpen(false)}
        >
          <DialogContent className="max-w-md">
            <DialogTitle>New membership plan</DialogTitle>
            <DialogDescription>
              Set a name, duration, and price.
            </DialogDescription>
            <form
              noValidate
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="createForm-register-name"
                  className="block text-xs font-medium text-foreground mb-1.5"
                >
                  Plan Name <span className="text-status-danger-fg">*</span>
                </label>
                <Input
                  aria-invalid={!!createForm.formState.errors.name}
                  aria-describedby={
                    createForm.formState.errors.name
                      ? "createForm-register-name-error"
                      : undefined
                  }
                  id="createForm-register-name"
                  type="text"
                  placeholder="e.g. 1 Month General Fitness"
                  {...createForm.register("name")}
                  className="w-full rounded-xl border border-border/70 bg-muted px-3.5 py-2 text-xs text-foreground placeholder:text-dim/60 focus:bg-card focus:border-foreground/30 focus:outline-none transition-all"
                />
                {createForm.formState.errors.name && (
                  <p
                    id="createForm-register-name-error"
                    role="alert"
                    className="mt-1 text-[11px] text-status-danger-fg"
                  >
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="createForm-register-durationDays"
                    className="block text-xs font-medium text-foreground mb-1.5"
                  >
                    Duration (Days) <span className="text-status-danger-fg">*</span>
                  </label>
                  <Input
                    aria-invalid={!!createForm.formState.errors.durationDays}
                    aria-describedby={
                      createForm.formState.errors.durationDays
                        ? "createForm-register-durationDays-error"
                        : undefined
                    }
                    id="createForm-register-durationDays"
                    type="number"
                    min={1}
                    max={730}
                    {...createForm.register("durationDays", {
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border border-border/70 bg-muted px-3.5 py-2 text-xs text-foreground focus:bg-card focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {createForm.formState.errors.durationDays && (
                    <p
                      id="createForm-register-durationDays-error"
                      role="alert"
                      className="mt-1 text-[11px] text-status-danger-fg"
                    >
                      {createForm.formState.errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="createForm-register-price"
                    className="block text-xs font-medium text-foreground mb-1.5"
                  >
                    Price (₹ INR) <span className="text-status-danger-fg">*</span>
                  </label>
                  <Input
                    aria-invalid={!!createForm.formState.errors.price}
                    aria-describedby={
                      createForm.formState.errors.price
                        ? "createForm-register-price-error"
                        : undefined
                    }
                    id="createForm-register-price"
                    type="number"
                    min={0}
                    {...createForm.register("price", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border/70 bg-muted px-3.5 py-2 text-xs text-foreground focus:bg-card focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {createForm.formState.errors.price && (
                    <p
                      id="createForm-register-price-error"
                      role="alert"
                      className="mt-1 text-[11px] text-status-danger-fg"
                    >
                      {createForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  aria-invalid={!!createForm.formState.errors.isActive}
                  aria-describedby={
                    createForm.formState.errors.isActive
                      ? "create-isActive-error"
                      : undefined
                  }
                  id="create-isActive"
                  {...createForm.register("isActive")}
                  className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                />
                <label className="text-xs text-foreground cursor-pointer">
                  Available for new enrollments (Active status)
                </label>
              </div>

              {createForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {createForm.formState.errors.root.message}
                </p>
              )}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {createForm.formState.isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Create Plan</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Plan Dialog */}
      {editingPlan && (
        <Dialog
          open={!!editingPlan}
          onOpenChange={(open) => !open && setEditingPlan(null)}
        >
          <DialogContent className="max-w-md">
            <DialogTitle>Edit membership plan</DialogTitle>
            <DialogDescription>Update your plan details.</DialogDescription>
            <form
              noValidate
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="editForm-register-name"
                  className="block text-xs font-medium text-foreground mb-1.5"
                >
                  Plan Name <span className="text-status-danger-fg">*</span>
                </label>
                <Input
                  aria-invalid={!!editForm.formState.errors.name}
                  aria-describedby={
                    editForm.formState.errors.name
                      ? "editForm-register-name-error"
                      : undefined
                  }
                  id="editForm-register-name"
                  type="text"
                  {...editForm.register("name")}
                  className="w-full rounded-xl border border-border/70 bg-muted px-3.5 py-2 text-xs text-foreground placeholder:text-dim/60 focus:bg-card focus:border-foreground/30 focus:outline-none transition-all"
                />
                {editForm.formState.errors.name && (
                  <p
                    id="editForm-register-name-error"
                    role="alert"
                    className="mt-1 text-[11px] text-status-danger-fg"
                  >
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="editForm-register-durationDays"
                    className="block text-xs font-medium text-foreground mb-1.5"
                  >
                    Duration (Days) <span className="text-status-danger-fg">*</span>
                  </label>
                  <Input
                    aria-invalid={!!editForm.formState.errors.durationDays}
                    aria-describedby={
                      editForm.formState.errors.durationDays
                        ? "editForm-register-durationDays-error"
                        : undefined
                    }
                    id="editForm-register-durationDays"
                    type="number"
                    min={1}
                    max={730}
                    {...editForm.register("durationDays", {
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border border-border/70 bg-muted px-3.5 py-2 text-xs text-foreground focus:bg-card focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {editForm.formState.errors.durationDays && (
                    <p
                      id="editForm-register-durationDays-error"
                      role="alert"
                      className="mt-1 text-[11px] text-status-danger-fg"
                    >
                      {editForm.formState.errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="editForm-register-price"
                    className="block text-xs font-medium text-foreground mb-1.5"
                  >
                    Price (₹ INR) <span className="text-status-danger-fg">*</span>
                  </label>
                  <Input
                    aria-invalid={!!editForm.formState.errors.price}
                    aria-describedby={
                      editForm.formState.errors.price
                        ? "editForm-register-price-error"
                        : undefined
                    }
                    id="editForm-register-price"
                    type="number"
                    min={0}
                    {...editForm.register("price", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border/70 bg-muted px-3.5 py-2 text-xs text-foreground focus:bg-card focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {editForm.formState.errors.price && (
                    <p
                      id="editForm-register-price-error"
                      role="alert"
                      className="mt-1 text-[11px] text-status-danger-fg"
                    >
                      {editForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  aria-invalid={!!editForm.formState.errors.isActive}
                  aria-describedby={
                    editForm.formState.errors.isActive
                      ? "edit-isActive-error"
                      : undefined
                  }
                  id="edit-isActive"
                  {...editForm.register("isActive")}
                  className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                />
                <label className="text-xs text-foreground cursor-pointer">
                  Available for new enrollments (Active status)
                </label>
              </div>

              {editForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {editForm.formState.errors.root.message}
                </p>
              )}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {editForm.formState.isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
