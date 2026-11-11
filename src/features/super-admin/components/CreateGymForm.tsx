"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGymSchema, CreateGymInput } from "@/schemas/gym.schema";
import { createGymAction } from "@/actions/gym.actions";
import { PressableButton } from "@/components/motion/PressableButton";
import { toast } from "sonner";
import { LuMapPin, LuExternalLink, LuClipboardCopy } from "react-icons/lu";

export function CreateGymForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasteString, setPasteString] = useState("");

  const form = useForm<CreateGymInput>({
    resolver: zodResolver(createGymSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
      attendanceRadiusMeters: 50,
      timezone: "Asia/Kolkata",
      maxCustomers: 50,
      receiptPrefix: "REC",
      ownerEmail: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const currentLat = watch("latitude");
  const currentLng = watch("longitude");

  // Auto-split pasted Google Maps string e.g. "28.528352, 77.219154"
  const handleAutoSplit = (val: string) => {
    setPasteString(val);
    if (!val) return;

    const parts = val.split(/[,\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0] || "");
      const lng = parseFloat(parts[1] || "");

      if (!isNaN(lat) && !isNaN(lng)) {
        setValue("latitude", Number(lat.toFixed(6)), { shouldValidate: true });
        setValue("longitude", Number(lng.toFixed(6)), { shouldValidate: true });
        toast.success(`Coordinates extracted: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    }
  };

  const onSubmit = async (data: CreateGymInput) => {
    setIsSubmitting(true);
    try {
      const res = await createGymAction(data);
      if (res.success) {
        toast.success(`Gym "${data.name}" created and invitation sent!`);
        router.push("/super-admin/gyms");
      } else {
        toast.error(res.error || "Failed to create gym.");
      }
    } catch {
      toast.error("An unexpected error occurred while creating the gym.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapPreviewUrl =
    currentLat && currentLng && !isNaN(currentLat) && !isNaN(currentLng)
      ? `https://www.google.com/maps?q=${currentLat},${currentLng}`
      : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Gym Information</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Basic tenant details and receipt configuration.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Gym Name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Iron Peak Fitness"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Facility Physical Address <span className="text-destructive">*</span>
          </label>
          <textarea
            {...register("address")}
            rows={2}
            placeholder="e.g. Select Citywalk, Saket District Centre, New Delhi, Delhi 110017"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Receipt Prefix <span className="text-destructive">*</span>
          </label>
          <input
            {...register("receiptPrefix")}
            type="text"
            placeholder="REC"
            maxLength={8}
            className="w-full uppercase rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Prefix for generated receipts (e.g. REC-2026-00001)
          </p>
          {errors.receiptPrefix && (
            <p className="mt-1 text-xs text-destructive">
              {errors.receiptPrefix.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Customer Capacity Limit
          </label>
          <input
            {...register("maxCustomers", { valueAsNumber: true })}
            type="number"
            defaultValue={50}
            min={5}
            max={500}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Default limit is 50 members per tenant
          </p>
          {errors.maxCustomers && (
            <p className="mt-1 text-xs text-destructive">
              {errors.maxCustomers.message}
            </p>
          )}
        </div>
      </div>

      {/* Manual GPS Coordinates Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-1">
          <LuMapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Attendance GPS Geofence (Super Admin Only)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          GPS coordinates must be configured manually by platform administrators. Gym owners see coordinates read-only.
        </p>

        {/* Quick paste helper */}
        <div className="mb-4 rounded-xl border border-dashed border-border bg-slate-50/70 p-3.5 dark:bg-slate-900/50">
          <label className="block text-xs font-semibold text-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <LuClipboardCopy className="h-3.5 w-3.5 text-primary" />
              Paste Google Maps Coordinates String
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pasteString}
              onChange={(e) => handleAutoSplit(e.target.value)}
              placeholder="e.g. 28.528352, 77.219154"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => handleAutoSplit(pasteString)}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-slate-200"
            >
              Split
            </button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Right-click any location on Google Maps to copy &quot;lat, lng&quot;, then paste here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Latitude (-90 to 90) <span className="text-destructive">*</span>
            </label>
            <input
              {...register("latitude", { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="28.528352"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            {errors.latitude && (
              <p className="mt-1 text-xs text-destructive">{errors.latitude.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Longitude (-180 to 180) <span className="text-destructive">*</span>
            </label>
            <input
              {...register("longitude", { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="77.219154"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            {errors.longitude && (
              <p className="mt-1 text-xs text-destructive">{errors.longitude.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Attendance Radius (Meters)
            </label>
            <input
              {...register("attendanceRadiusMeters", { valueAsNumber: true })}
              type="number"
              defaultValue={50}
              min={10}
              max={500}
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.attendanceRadiusMeters && (
              <p className="mt-1 text-xs text-destructive">
                {errors.attendanceRadiusMeters.message}
              </p>
            )}
          </div>
        </div>

        {mapPreviewUrl && (
          <div className="mt-3">
            <a
              href={mapPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>Preview location on Google Maps</span>
              <LuExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Gym Owner Invitation Section */}
      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-bold text-foreground">
          Gym Owner Invitation (Admin)
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          An invitation will be dispatched to this email. When the owner signs in, they will be bound to this gym automatically.
        </p>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Gym Owner Email Address <span className="text-destructive">*</span>
          </label>
          <input
            {...register("ownerEmail")}
            type="email"
            placeholder="owner@ironpeak.com"
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.ownerEmail && (
            <p className="mt-1 text-xs text-destructive">
              {errors.ownerEmail.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <PressableButton
          type="button"
          variant="outline"
          onClick={() => router.push("/super-admin/gyms")}
          disabled={isSubmitting}
        >
          Cancel
        </PressableButton>
        <PressableButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating Gym..." : "Create Gym & Invite Owner"}
        </PressableButton>
      </div>
    </form>
  );
}

