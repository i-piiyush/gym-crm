"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CountdownRing } from "@/components/motion/CountdownRing";
import { motion, AnimatePresence } from "motion/react";
import { Maximize2, Minimize2, QrCode, ShieldCheck, Link2 } from "lucide-react";

interface QrCodeStationProps {
  gymId: string;
  gymName: string;
  initialToken: string;
  initialSecondsRemaining: number;
  appUrl: string;
}

export function QrCodeStation({
  gymId,
  gymName,
  initialToken,
  initialSecondsRemaining,
  appUrl,
}: QrCodeStationProps) {
  const [token, setToken] = useState(initialToken);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSecondsRemaining);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic base URL resolution for mobile scanners:
  // 1. process.env.NEXT_PUBLIC_APP_URL if explicitly non-localhost (e.g. http://172.20.10.2:3000)
  // 2. window.location.origin if tablet/browser is opened via local IP or public domain
  // 3. appUrl prop passed from server
  const [resolvedBaseUrl, setResolvedBaseUrl] = useState(appUrl);

  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      setResolvedBaseUrl(envUrl);
    } else if (
      typeof window !== "undefined" &&
      window.location.origin &&
      !window.location.origin.includes("localhost") &&
      !window.location.origin.includes("127.0.0.1")
    ) {
      setResolvedBaseUrl(window.location.origin);
    } else if (appUrl) {
      setResolvedBaseUrl(appUrl.replace(/\/+$/, ""));
    }
  }, [appUrl]);

  // Fetch rotating token from client endpoint
  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance/qr-token?gymId=${gymId}`);
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setSecondsRemaining(data.secondsRemaining || 300);
      }
    } catch (e) {
      console.error("Failed to rotate QR token:", e);
    }
  }, [gymId]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          refreshToken();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshToken]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const checkInUrl = `${resolvedBaseUrl}/checkin?t=${encodeURIComponent(token)}`;

  return (
    <div
      className={`flex flex-col items-center justify-center transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#FAFAF8] p-8"
          : "apple-card p-8"
      }`}
    >
      {/* Station Header */}
      <div className="flex w-full items-center justify-between border-b border-[rgba(40,40,40,0.06)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#242424] text-white shadow-sm">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#242424]">{gymName}</h1>
            <p className="text-xs text-[#71697a]">
              Reception Check-in Station • 5-Minute Dynamic Geofence QR
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="apple-button-press inline-flex items-center gap-1.5 rounded-full border border-[rgba(40,40,40,0.08)] bg-white px-3.5 py-1.5 text-xs font-medium text-[#242424] hover:bg-stone-50"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen Kiosk</span>
            </>
          )}
        </button>
      </div>

      {/* Main QR Display */}
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="relative rounded-3xl border-4 border-stone-200/80 bg-white p-6 shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={token}
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <QRCodeSVG
                value={checkInUrl}
                size={isFullscreen ? 360 : 260}
                level="M"
                includeMargin={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Target URL Badge */}
        <div className="mt-3 flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 px-3 py-1 text-[11px] font-mono text-[#71697a] border border-border/40">
          <Link2 className="h-3 w-3 text-dim" />
          <span className="truncate max-w-[280px]">
            {checkInUrl.split("?")[0]}
          </span>
        </div>

        {/* 5-minute Animated Countdown Ring */}
        <div className="mt-5 flex items-center gap-3">
          <CountdownRing
            totalSeconds={300}
            secondsRemaining={secondsRemaining}
            size={50}
            strokeWidth={3.5}
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#242424]">
              Rotates every 5 minutes
            </span>
            <span className="text-[11px] text-[#71697a] font-mono">
              HMAC-SHA256 hardware token
            </span>
          </div>
        </div>
      </div>

      {/* Instructions Banner */}
      <div className="flex max-w-md items-center gap-3 rounded-2xl border border-[rgba(40,40,40,0.06)] bg-[#d0e1d4]/30 p-4 text-xs text-emerald-950">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-800" />
        <p className="leading-relaxed">
          Members &amp; trainers: Scan this QR with your mobile camera. Your phone will verify you are within the facility geofence to log attendance.
        </p>
      </div>
    </div>
  );
}
