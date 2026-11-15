"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Camera,
  Keyboard,
  RotateCcw,
  Home,
  Check,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { QrCameraScanner, extractQrToken, playPaytmChime } from "./QrCameraScanner";

interface CheckInCardProps {
  initialToken?: string;
  gymName?: string;
  gymCoords?: {
    latitude: number;
    longitude: number;
  };
  userRole?: string;
}

export function CheckInCard({
  initialToken = "",
  gymName = "Gym Facility",
  gymCoords,
  userRole = "CUSTOMER",
}: CheckInCardProps) {
  const router = useRouter();

  // Determine dashboard route according to user role
  const roleNormalized = userRole?.toUpperCase() || "CUSTOMER";
  const dashboardRoute =
    roleNormalized === "TRAINER"
      ? "/trainer"
      : roleNormalized === "ADMIN" || roleNormalized === "SUPER_ADMIN"
      ? "/admin"
      : "/customer";

  const [token, setToken] = useState(initialToken);
  const [activeTab, setActiveTab] = useState<"CAMERA" | "MANUAL">("CAMERA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Success result
  const [checkInSuccess, setCheckInSuccess] = useState<{
    message: string;
    distanceMeters: number;
    accuracyMeters: number;
    alreadyMarked: boolean;
    checkInAt?: string;
  } | null>(null);

  // Error result
  const [checkInError, setCheckInError] = useState<string | null>(null);

  const {
    latitude,
    longitude,
    accuracy,
    isLoading: isLocating,
    error: geoError,
    requestCoordinates,
    setManualCoordinates,
  } = useGeolocation();

  // Pre-prime coordinates on component load
  const hasPrimedGeo = useRef(false);
  useEffect(() => {
    if (!hasPrimedGeo.current) {
      hasPrimedGeo.current = true;
      requestCoordinates().catch(() => {});
    }
  }, [requestCoordinates]);

  // Automatic redirect countdown effect upon successful check-in
  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown <= 0) {
      router.push(dashboardRoute);
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, dashboardRoute, router]);

  // Dev-only Simulator Presets
  const isSimulatorEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GEO_SIMULATOR === "true";

  const applyPreset = (preset: "AT_GYM" | "60M_AWAY" | "5KM_AWAY" | "WEAK_ACCURACY") => {
    const baseLat = gymCoords?.latitude || 28.528352;
    const baseLng = gymCoords?.longitude || 77.219154;

    switch (preset) {
      case "AT_GYM":
        setManualCoordinates(baseLat, baseLng, 12);
        toast.info("Preset: At gym entrance (0m distance, ±12m accuracy)");
        break;
      case "60M_AWAY":
        setManualCoordinates(baseLat + 0.00054, baseLng, 15);
        toast.info("Preset: 60m away (Borderline geofence breach)");
        break;
      case "5KM_AWAY":
        setManualCoordinates(baseLat + 0.045, baseLng, 20);
        toast.info("Preset: 5km away (Far from facility)");
        break;
      case "WEAK_ACCURACY":
        setManualCoordinates(baseLat, baseLng, 120);
        toast.info("Preset: Weak GPS Signal (±120m accuracy)");
        break;
    }
  };

  /**
   * Core verification & submission logic
   * Triggered automatically upon camera detection or manual submission
   */
  const executeCheckIn = useCallback(
    async (rawToken: string) => {
      const cleanToken = extractQrToken(rawToken);
      if (!cleanToken) {
        toast.error("Please provide a valid pass token.");
        return;
      }

      setToken(cleanToken);
      setIsSubmitting(true);
      setCheckInError(null);
      setStatusMessage("Acquiring GPS location...");

      try {
        // 1. Obtain coordinates if not already cached
        let currentLat = latitude;
        let currentLng = longitude;
        let currentAcc = accuracy;

        if (!currentLat || !currentLng || currentAcc === null) {
          try {
            const coords = await requestCoordinates();
            currentLat = coords.latitude;
            currentLng = coords.longitude;
            currentAcc = coords.accuracy;
          } catch (geoErr: unknown) {
            const geoMsg = geoErr instanceof Error ? geoErr.message : "GPS permission required";
            throw new Error(`Location check failed: ${geoMsg}`);
          }
        }

        setStatusMessage("Verifying 50m geofence perimeter...");

        // 2. Submit to attendance check-in endpoint
        const response = await fetch("/api/attendance/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: cleanToken,
            latitude: currentLat,
            longitude: currentLng,
            accuracy: currentAcc,
          }),
        });

        const res = await response.json();

        if (res.success) {
          playPaytmChime(true);
          setCheckInSuccess({
            message: res.data.message || "Attendance recorded successfully!",
            distanceMeters: res.data.distanceMeters,
            accuracyMeters: res.data.accuracyMeters,
            alreadyMarked: res.data.alreadyMarked,
            checkInAt: res.data.checkInAt,
          });
          toast.success(res.data.alreadyMarked ? "Already checked in today!" : "Attendance verified & recorded!");

          // Start 2-second automatic redirect countdown to role dashboard
          setRedirectCountdown(2);
        } else {
          playPaytmChime(false);
          const errorMsg = res.error || "Attendance verification failed.";
          setCheckInError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err: unknown) {
        playPaytmChime(false);
        const msg = err instanceof Error ? err.message : "Failed to verify attendance.";
        setCheckInError(msg);
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
        setStatusMessage(null);
      }
    },
    [latitude, longitude, accuracy, requestCoordinates]
  );

  // If page was loaded with a query token ?t=..., auto-execute check-in immediately
  useEffect(() => {
    if (initialToken && !checkInSuccess && !checkInError && !isSubmitting) {
      executeCheckIn(initialToken);
    }
  }, [initialToken, executeCheckIn, checkInSuccess, checkInError, isSubmitting]);

  // Reset to scan again
  const handleReset = () => {
    setCheckInSuccess(null);
    setCheckInError(null);
    setRedirectCountdown(null);
    setToken("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* 1. CELEBRATION SUCCESS SCREEN (Paytm / PhonePe Confirmation) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {checkInSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-3xl border border-[#B5D5BD] bg-white p-7 text-center shadow-[0_8px_30px_rgba(32,78,43,0.08)]"
          >
            {/* Animated Celebration Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-honeydew text-[#204E2B] shadow-inner mb-4"
            >
              <Check className="h-10 w-10 stroke-[3]" />
            </motion.div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-honeydew/60 border border-[#B5D5BD] px-3 py-1 text-xs font-semibold text-[#204E2B] mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{checkInSuccess.alreadyMarked ? "Already Logged Today" : "Verified & Confirmed"}</span>
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {checkInSuccess.alreadyMarked ? "Already Checked In" : "Attendance Recorded!"}
            </h2>

            <p className="mt-1 text-xs text-dim max-w-xs mx-auto leading-relaxed">
              {checkInSuccess.message}
            </p>

            {/* Auto Redirect Banner */}
            {redirectCountdown !== null && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-honeydew/40 border border-[#B5D5BD] py-2 px-3 text-xs font-medium text-[#204E2B]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>
                  Redirecting to {roleNormalized === "TRAINER" ? "Trainer" : "Member"} Dashboard in {redirectCountdown}s...
                </span>
              </div>
            )}

            {/* Facility & Geofence Verification Details */}
            <div className="mt-5 rounded-2xl bg-[#FAFAF8] border border-border/80 p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dim">Facility Center</span>
                <span className="font-semibold text-foreground">{gymName}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
                <span className="text-dim">Proximity to Gym</span>
                <span className="font-mono font-semibold text-[#204E2B] tabular-nums">
                  {checkInSuccess.distanceMeters}m from entrance
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
                <span className="text-dim">GPS Sensor Accuracy</span>
                <span className="font-mono text-dim tabular-nums">
                  ±{Math.round(checkInSuccess.accuracyMeters)}m
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => router.push(dashboardRoute)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground py-3 text-xs font-semibold text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <Home className="h-4 w-4" />
                <span>Go to Dashboard Now</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background py-2.5 text-xs font-medium text-foreground hover:bg-surface active:scale-[0.98] transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5 text-dim" />
                <span>Scan Another Pass</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. ERROR SCREEN (Prominent feedback if check-in rejected)    */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {checkInError && !checkInSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-center text-rose-950 shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
              <XCircle className="h-8 w-8 stroke-[2.5]" />
            </div>

            <h3 className="text-base font-bold text-rose-950">
              Check-In Verification Failed
            </h3>

            <p className="mt-2 text-xs font-medium text-rose-900 leading-relaxed max-w-sm mx-auto">
              {checkInError}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Scan Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCheckInError(null);
                  setActiveTab("MANUAL");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-4 py-2.5 text-xs font-medium text-rose-900 hover:bg-rose-50 transition-all"
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>Manual Entry</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACTIVE SCANNER CARD (When not showing success)             */}
      {/* ------------------------------------------------------------- */}
      {!checkInSuccess && (
        <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-dim">
                <Radio className="h-4 w-4 text-dim" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                  {gymName}
                </span>
              </div>

              {/* Real-time GPS status pill */}
              <div className="flex items-center gap-1.5 rounded-full bg-[#F5F5F3] px-2.5 py-0.5 text-[11px] font-medium text-dim tabular-nums">
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span>
                  {accuracy !== null ? `GPS: ±${Math.round(accuracy)}m` : isLocating ? "Acquiring GPS..." : "GPS Standby"}
                </span>
              </div>
            </div>

            <h1 className="mt-2 text-lg font-bold tracking-tight text-foreground">
              Scan Reception QR Code
            </h1>
            <p className="mt-0.5 text-xs text-dim">
              Point your camera at the front desk screen to automatically verify location and record attendance.
            </p>
          </div>

          {/* Mode Switcher Tabs (Paytm Camera vs Manual) */}
          <div className="mt-4 flex rounded-xl bg-[#F5F5F3] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("CAMERA")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all ${
                activeTab === "CAMERA"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-dim hover:text-foreground"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Camera Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MANUAL")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all ${
                activeTab === "MANUAL"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-dim hover:text-foreground"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Manual &amp; Dev Presets</span>
            </button>
          </div>

          {/* Geolocation Permission Error Banner */}
          {geoError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-950">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold">Location Access Needed:</span> {geoError}. Enable GPS permissions to mark attendance.
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 1: PAYTM / PHONEPE CAMERA SCANNER                      */}
          {/* --------------------------------------------------------- */}
          {activeTab === "CAMERA" && (
            <div className="mt-4 space-y-3">
              <QrCameraScanner
                onScan={executeCheckIn}
                isProcessing={isSubmitting}
                onSwitchToManual={() => setActiveTab("MANUAL")}
              />

              {statusMessage && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <p className="text-center text-[11px] text-dim">
                The scanner automatically detects the QR code and checks your proximity within 50 meters.
              </p>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 2: MANUAL TOKEN & DEV GEOLOCATION SIMULATOR           */}
          {/* --------------------------------------------------------- */}
          {activeTab === "MANUAL" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  5-Minute Pass Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste or enter token..."
                  className="w-full rounded-xl border border-border/70 bg-[#F5F5F3] px-3.5 py-2.5 font-mono text-xs text-foreground placeholder:text-dim/60 focus:bg-white focus:border-foreground/30 focus:outline-none transition-all"
                />
                <p className="mt-1.5 text-[11px] text-dim">
                  Valid for 5 minutes at the reception desk kiosk (`/admin/attendance/qr`).
                </p>
              </div>

              {/* Dev Simulator Widget */}
              {isSimulatorEnabled && (
                <div className="rounded-2xl border border-dashed border-sand bg-cream/40 p-4 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                    <Sparkles className="h-4 w-4 text-dim" />
                    <span>Dev Geolocation Simulator</span>
                  </div>
                  <p className="text-[11px] text-dim mb-3">
                    Simulate your physical distance from the facility:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("AT_GYM")}
                      className="rounded-xl border border-border bg-white px-3 py-2 text-[11px] font-medium text-foreground hover:bg-stone-50 transition-colors shadow-xs"
                    >
                      At Entrance (0m)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("60M_AWAY")}
                      className="rounded-xl border border-border bg-white px-3 py-2 text-[11px] font-medium text-foreground hover:bg-stone-50 transition-colors shadow-xs"
                    >
                      60m Away (Reject)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("5KM_AWAY")}
                      className="rounded-xl border border-border bg-white px-3 py-2 text-[11px] font-medium text-foreground hover:bg-stone-50 transition-colors shadow-xs"
                    >
                      5km Away (Reject)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("WEAK_ACCURACY")}
                      className="rounded-xl border border-border bg-white px-3 py-2 text-[11px] font-medium text-foreground hover:bg-stone-50 transition-colors shadow-xs"
                    >
                      Weak Signal (120m)
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => executeCheckIn(token)}
                disabled={isSubmitting || !token}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground py-3 text-xs font-semibold text-background hover:bg-foreground/90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Proximity...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Mark Attendance</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
