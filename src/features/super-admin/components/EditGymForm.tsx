"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateGymSchema, UpdateGymInput } from "@/schemas/gym.schema";
import { updateGymAction } from "@/actions/gym.actions";
import { PressableButton } from "@/components/motion/PressableButton";
import { toast } from "sonner";
import { LuMapPin, LuExternalLink, LuClipboardCopy } from "react-icons/lu";
import { GymDetailsView } from "@/types/gym.types";

interface EditGymFormProps {
  gym: GymDetailsView;
}

export function EditGymForm({ gym }: EditGymFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasteString, setPasteString] = useState("");

  const form = useForm<UpdateGymInput>({
    resolver: zodResolver(updateGymSchema),
    defaultValues: {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      latitude: gym.latitude,
      longitude: gym.longitude,
      attendanceRadiusMeters: gym.attendanceRadiusMeters,
      receiptPrefix: gym.receiptPrefix,
      status: gym.status,
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
        toast.success(`Coordinates updated: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    }
  };

  const onSubmit = async (data: UpdateGymInput) => {
    setIsSubmitting(true);
    try {
      const res = await updateGymAction(data);
      if (res.success) {
        toast.success(`Gym "${data.name}" updated successfully.`);
        router.push("/super-admin/gyms");
      } else {
        toast.error(res.error || "Failed to update gym.");
      }
    } catch {
      toast.error("An unexpected error occurred while updating the gym.");
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
      <input type="hidden" {...register("id")} />

      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-foreground">Edit Gym Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Modify operational configuration, geofence radius, and active status.
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
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Facility Address <span className="text-destructive">*</span>
          </label>
          <textarea
            {...register("address")}
            rows={2}
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
            maxLength={8}
            className="w-full uppercase rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.receiptPrefix && (
            <p className="mt-1 text-xs text-destructive">
              {errors.receiptPrefix.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Operational Status
          </label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* GPS Coordinates Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-1">
          <LuMapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Attendance GPS Coordinates
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Modifying coordinates shifts the check-in geofence for all members of this gym.
        </p>

        {/* Quick paste helper */}
        <div className="mb-4 rounded-xl border border-dashed border-border bg-slate-50/70 p-3.5 dark:bg-slate-900/50">
          <label className="block text-xs font-semibold text-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <LuClipboardCopy className="h-3.5 w-3.5 text-primary" />
              Paste Google Maps Coordinates
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
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Latitude <span className="text-destructive">*</span>
            </label>
            <input
              {...register("latitude", { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            {errors.latitude && (
              <p className="mt-1 text-xs text-destructive">{errors.latitude.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Longitude <span className="text-destructive">*</span>
            </label>
            <input
              {...register("longitude", { valueAsNumber: true })}
              type="number"
              step="any"
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
              <span>Preview updated location on Google Maps</span>
              <LuExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </PressableButton>
      </div>
    </form>
  );
}

