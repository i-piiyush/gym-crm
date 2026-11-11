"use client";

import { useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { PressableButton } from "@/components/motion/PressableButton";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  LuMapPin,
  LuCircleCheck,
  LuTriangleAlert,
  LuLoader,
  LuShieldAlert,
  LuSparkles,
} from "react-icons/lu";

interface CheckInCardProps {
  initialToken?: string;
  gymName?: string;
  gymCoords?: {
    latitude: number;
    longitude: number;
  };
}

export function CheckInCard({
  initialToken = "",
  gymName = "Gym",
  gymCoords,
}: CheckInCardProps) {
  const [token, setToken] = useState(initialToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState<{
    message: string;
    distanceMeters: number;
    accuracyMeters: number;
    alreadyMarked: boolean;
  } | null>(null);

  const {
    latitude,
    longitude,
    accuracy,
    isLoading: isLocating,
    error: geoError,
    requestCoordinates,
    setManualCoordinates,
  } = useGeolocation();

  // Dev-only Simulator Presets
  const isSimulatorEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GEO_SIMULATOR === "true";

  const applyPreset = (preset: "AT_GYM" | "60M_AWAY" | "5KM_AWAY" | "WEAK_ACCURACY") => {
    const baseLat = gymCoords?.latitude || 28.528352;
    const baseLng = gymCoords?.longitude || 77.219154;

    switch (preset) {
      case "AT_GYM":
        setManualCoordinates(baseLat, baseLng, 12);
        toast.info("Preset applied: At gym entrance (0m distance, ±12m accuracy)");
        break;
      case "60M_AWAY":
        // ~0.00054 degrees is approximately 60 meters
        setManualCoordinates(baseLat + 0.00054, baseLng, 15);
        toast.info("Preset applied: 60m away (Borderline geofence breach)");
        break;
      case "5KM_AWAY":
        // ~0.045 degrees is approximately 5 km
        setManualCoordinates(baseLat + 0.045, baseLng, 20);
        toast.info("Preset applied: 5km away (Far from facility)");
        break;
      case "WEAK_ACCURACY":
        setManualCoordinates(baseLat, baseLng, 120);
        toast.info("Preset applied: Weak GPS Signal (±120m accuracy)");
        break;
    }
  };

  const handleCheckIn = async () => {
    if (!token) {
      toast.error("Please enter or scan a valid QR token.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Obtain coordinates if not already populated
      let currentLat = latitude;
      let currentLng = longitude;
      let currentAcc = accuracy;

      if (!currentLat || !currentLng || currentAcc === null) {
        toast.loading("Acquiring high-accuracy GPS coordinates...", { id: "geo" });
        const coords = await requestCoordinates();
        currentLat = coords.latitude;
        currentLng = coords.longitude;
        currentAcc = coords.accuracy;
        toast.dismiss("geo");
      }

      // 2. Submit to check-in endpoint
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          latitude: currentLat,
          longitude: currentLng,
          accuracy: currentAcc,
        }),
      });

      const res = await response.json();

      if (res.success) {
        if (res.data.alreadyMarked) {
          toast.info(res.data.message || "Already marked for today!");
        } else {
          toast.success(res.data.message || "Attendance recorded successfully!");
        }

        setCheckInSuccess({
          message: res.data.message,
          distanceMeters: res.data.distanceMeters,
          accuracyMeters: res.data.accuracyMeters,
          alreadyMarked: res.data.alreadyMarked,
        });
      } else {
        toast.error(res.error || "Attendance verification failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Success Card with Animated Check Icon */}
      <AnimatePresence>
        {checkInSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-2xl border p-6 text-center shadow-md ${
              checkInSuccess.alreadyMarked
                ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
                : "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
            >
              <LuCircleCheck className="h-10 w-10" />
            </motion.div>

            <h2 className="mt-4 text-xl font-bold">
              {checkInSuccess.alreadyMarked
                ? "Already Checked In Today"
                : "Attendance Recorded!"}
            </h2>

            <p className="mt-1 text-xs opacity-90 leading-relaxed">
              {checkInSuccess.message}
            </p>

            <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-current/20 px-3 py-1.5 text-xs font-medium">
              <span>Distance: {checkInSuccess.distanceMeters}m</span>
              <span>·</span>
              <span>GPS Accuracy: ±{Math.round(checkInSuccess.accuracyMeters)}m</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Check-In Form */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary">
            <LuMapPin className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {gymName} Check-in
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-foreground">
            Verify Location &amp; Check In
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Your browser will request GPS coordinates to verify physical proximity within 50 meters of the facility.
          </p>
        </div>

        {/* Geolocation Error Warning */}
        {geoError && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            <LuTriangleAlert className="h-5 w-5 shrink-0 text-rose-600" />
            <div className="leading-relaxed">
              <span className="font-bold">GPS Permission Needed:</span> {geoError}
            </div>
          </div>
        )}

        {/* Token Input Field */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              QR Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Scan QR or paste token..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Automatically populated when scanning the reception screen.
            </p>
          </div>

          {/* GPS Coordinates Preview */}
          <div className="rounded-xl border border-border bg-slate-50/70 p-3.5 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Your Reported Location</span>
              {isLocating && (
                <span className="flex items-center gap-1 text-primary">
                  <LuLoader className="h-3.5 w-3.5 animate-spin" />
                  <span>Locating...</span>
                </span>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block text-[10px] uppercase tracking-wider">
                  Latitude / Longitude
                </span>
                <span className="font-mono text-foreground">
                  {latitude && longitude
                    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    : "Not yet acquired"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider">
                  Accuracy
                </span>
                <span className="font-mono text-foreground">
                  {accuracy !== null ? `±${Math.round(accuracy)} meters` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Dev-only Simulator Preset Widget */}
          {isSimulatorEnabled && (
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-2">
                <LuSparkles className="h-4 w-4" />
                <span>Dev Geolocation Simulator Presets</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mb-3">
                Simulate different mobile positions to test geofence validation:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("AT_GYM")}
                  className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200"
                >
                  At Gym (0m)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("60M_AWAY")}
                  className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200"
                >
                  60m away (Reject)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("5KM_AWAY")}
                  className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200"
                >
                  5km away (Reject)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("WEAK_ACCURACY")}
                  className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200"
                >
                  Accuracy 120m (Weak)
                </button>
              </div>
            </div>
          )}

          <PressableButton
            onClick={handleCheckIn}
            disabled={isSubmitting || !token}
            className="w-full py-3"
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LuLoader className="h-4 w-4 animate-spin" />
                <span>Verifying Location &amp; Checking In...</span>
              </span>
            ) : (
              "Check In to Gym"
            )}
          </PressableButton>
        </div>
      </div>
    </div>
  );
}
