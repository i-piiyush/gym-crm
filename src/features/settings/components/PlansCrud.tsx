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
    createForm.reset({
      name: "",
      durationDays: 30,
      price: 1500,
      isActive: true,
    });
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
              Configure subscription tiers, validity durations, and pricing in INR.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-border/80 bg-background/50">
            <CreditCard className="h-8 w-8 text-dim/60 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No membership plans configured</p>
            <p className="text-xs text-dim mt-1 max-w-sm mx-auto">
              Create your first plan to start enrolling members and issuing digital payment receipts.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Plan</span>
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                plan.isActive
                  ? "border-border/80 bg-surface hover:shadow-md hover:border-border"
                  : "border-border/50 bg-[#F5F5F3]/60 opacity-70"
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

                  <button
                    onClick={() => handleToggleActive(plan)}
                    title={plan.isActive ? "Click to deactivate" : "Click to activate"}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
                      plan.isActive
                        ? "border-[#B5D5BD] bg-honeydew text-[#204E2B]"
                        : "border-border bg-background text-dim"
                    }`}
                  >
                    {plan.isActive ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-[#204E2B]" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-dim" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-baseline justify-between border-t border-border/40 pt-3.5">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-dim block font-medium">
                    Rate
                  </span>
                  <span className="font-semibold text-lg text-foreground tabular-nums">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                >
                  <Pencil className="h-3 w-3 text-dim" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Plan Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  New Membership Plan
                </h3>
                <p className="text-xs text-dim mt-0.5">Define duration and pricing in INR</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-1 text-dim hover:text-foreground hover:bg-background transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Plan Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Month General Fitness"
                  {...createForm.register("name")}
                  className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2 text-xs text-foreground placeholder:text-dim/60 focus:bg-white focus:border-foreground/30 focus:outline-none transition-all"
                />
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Duration (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    {...createForm.register("durationDays", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2 text-xs text-foreground focus:bg-white focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {createForm.formState.errors.durationDays && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {createForm.formState.errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Price (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...createForm.register("price", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2 text-xs text-foreground focus:bg-white focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {createForm.formState.errors.price && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {createForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="create-isActive"
                  {...createForm.register("isActive")}
                  className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                />
                <label htmlFor="create-isActive" className="text-xs text-foreground cursor-pointer">
                  Available for new enrollments (Active status)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {createForm.formState.isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  Edit Membership Plan
                </h3>
                <p className="text-xs text-dim mt-0.5">Modify pricing or validity period</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-full p-1 text-dim hover:text-foreground hover:bg-background transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Plan Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...editForm.register("name")}
                  className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2 text-xs text-foreground placeholder:text-dim/60 focus:bg-white focus:border-foreground/30 focus:outline-none transition-all"
                />
                {editForm.formState.errors.name && (
                  <p className="mt-1 text-[11px] text-rose-500">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Duration (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    {...editForm.register("durationDays", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2 text-xs text-foreground focus:bg-white focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {editForm.formState.errors.durationDays && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {editForm.formState.errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Price (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...editForm.register("price", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2 text-xs text-foreground focus:bg-white focus:border-foreground/30 focus:outline-none tabular-nums transition-all"
                  />
                  {editForm.formState.errors.price && (
                    <p className="mt-1 text-[11px] text-rose-500">
                      {editForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  {...editForm.register("isActive")}
                  className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
                />
                <label htmlFor="edit-isActive" className="text-xs text-foreground cursor-pointer">
                  Available for new enrollments (Active status)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {editForm.formState.isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
