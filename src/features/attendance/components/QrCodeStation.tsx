"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CountdownRing } from "@/components/motion/CountdownRing";
import { PressableButton } from "@/components/motion/PressableButton";
import { motion, AnimatePresence } from "motion/react";
import { LuMaximize2, LuMinimize2, LuQrCode, LuShieldCheck } from "react-icons/lu";

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

  // Fetch rotating token from client endpoint
  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance/qr-token?gymId=${gymId}`);
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setSecondsRemaining(data.secondsRemaining);
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
          return 15;
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

  const checkInUrl = `${appUrl}/checkin?t=${encodeURIComponent(token)}`;

  return (
    <div
      className={`flex flex-col items-center justify-center transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background p-8"
          : "rounded-3xl border border-border bg-card p-8 shadow-sm"
      }`}
    >
      {/* Station Header */}
      <div className="flex w-full items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LuQrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{gymName}</h1>
            <p className="text-xs text-muted-foreground">
              Reception Attendance Station · 15s Dynamic Geofence QR
            </p>
          </div>
        </div>

        <PressableButton
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5"
        >
          {isFullscreen ? (
            <>
              <LuMinimize2 className="h-4 w-4" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <LuMaximize2 className="h-4 w-4" />
              <span>Fullscreen Station</span>
            </>
          )}
        </PressableButton>
      </div>

      {/* Main QR Display */}
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="relative rounded-3xl border-4 border-primary/20 bg-white p-6 shadow-xl dark:border-primary/40">
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
                size={isFullscreen ? 360 : 280}
                level="M"
                includeMargin={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 15-second Animated Countdown Ring */}
        <div className="mt-6 flex items-center gap-3">
          <CountdownRing
            totalSeconds={15}
            secondsRemaining={secondsRemaining}
            size={48}
            strokeWidth={4}
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">
              Auto-refreshing dynamic code
            </span>
            <span className="text-[11px] text-muted-foreground">
              Stateless HMAC-SHA256 window
            </span>
          </div>
        </div>
      </div>

      {/* Instructions Banner */}
      <div className="flex max-w-md items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <LuShieldCheck className="h-6 w-6 shrink-0 text-primary" />
        <p className="leading-relaxed">
          Members & trainers: Scan this QR with your mobile camera. Your phone will verify you are within 50 meters of the facility to mark attendance.
        </p>
      </div>
    </div>
  );
}

