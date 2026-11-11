"use client";

import { useState } from "react";
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
  LuPlus,
  LuSquarePen,
  LuTag,
  LuCalendar,
  LuCircleCheck,
  LuCircleX,
  LuLoader,
  LuX,
} from "react-icons/lu";

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
    const res = await createPlanAction(data);
    if (!res.success) {
      toast.error(res.error || "Failed to create membership plan.");
      return;
    }
    toast.success(`Plan "${data.name}" created successfully.`);
    const newPlan: PlanItem = {
      id: res.data.id,
      name: res.data.name,
      durationDays: res.data.durationDays,
      price: Number(res.data.price),
      isActive: res.data.isActive,
    };
    setPlans((prev) => [...prev, newPlan].sort((a, b) => a.price - b.price));
    createForm.reset();
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (data: UpdatePlanInput) => {
    const res = await updatePlanAction(data);
    if (!res.success) {
      toast.error(res.error || "Failed to update membership plan.");
      return;
    }
    toast.success(`Plan "${data.name}" updated successfully.`);
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
          : p
      )
    );
    setEditingPlan(null);
  };

  const handleToggleActive = async (plan: PlanItem) => {
    const res = await updatePlanAction({
      id: plan.id,
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      isActive: !plan.isActive,
    });
    if (res.success) {
      toast.success(
        `Plan "${plan.name}" is now ${!plan.isActive ? "active" : "inactive"}.`
      );
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      );
    } else {
      toast.error(res.error || "Failed to toggle plan status.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-primary dark:bg-emerald-950/40">
            <LuTag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Membership Plans</h2>
            <p className="text-xs text-muted-foreground">
              Configure subscription tiers, validity durations, and pricing in INR.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <LuPlus className="h-4 w-4" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
            No membership plans configured yet. Create one to start accepting payments.
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 transition-all ${
                plan.isActive
                  ? "border-border bg-slate-50/50 dark:bg-slate-900/40"
                  : "border-border/60 bg-slate-100/50 dark:bg-slate-900/20 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{plan.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <LuCalendar className="h-3 w-3" />
                    <span>{plan.durationDays} Days</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(plan)}
                  title={plan.isActive ? "Click to deactivate" : "Click to activate"}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border transition-colors ${
                    plan.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {plan.isActive ? (
                    <>
                      <LuCircleCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <LuCircleX className="h-3 w-3 text-slate-500" />
                      <span>Inactive</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-mono text-lg font-bold text-foreground">
                  ₹{plan.price.toLocaleString("en-IN")}
                </span>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <LuSquarePen className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Plan Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create Membership Plan</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Month General Fitness"
                  {...createForm.register("name")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    {...createForm.register("durationDays", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {createForm.formState.errors.durationDays && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {createForm.formState.errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...createForm.register("price", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {createForm.formState.errors.price && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {createForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-isActive"
                  {...createForm.register("isActive")}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="create-isActive" className="text-xs text-foreground">
                  Available for new enrollments (Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createForm.formState.isSubmitting && (
                    <LuLoader className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Create Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Dialog */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Edit Membership Plan</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  {...editForm.register("name")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {editForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    {...editForm.register("durationDays", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {editForm.formState.errors.durationDays && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {editForm.formState.errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...editForm.register("price", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {editForm.formState.errors.price && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {editForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  {...editForm.register("isActive")}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="edit-isActive" className="text-xs text-foreground">
                  Available for new enrollments (Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {editForm.formState.isSubmitting && (
                    <LuLoader className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

