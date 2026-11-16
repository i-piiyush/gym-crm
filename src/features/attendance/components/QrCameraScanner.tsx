"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Flashlight,
  RefreshCw,
  Upload,
  AlertCircle,
  Loader2,
  Sparkles,
  HelpCircle,
  Keyboard,
  Lock,
} from "lucide-react";

interface QrCameraScannerProps {
  onScan: (token: string) => void;
  isProcessing?: boolean;
  onSwitchToManual?: () => void;
}

/**
 * Extracts raw token string whether the QR code content is a full URL or direct token
 */
export function extractQrToken(raw: string): string {
  const trimmed = raw.trim();
  try {
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.includes("?t=") ||
      trimmed.includes("&t=")
    ) {
      const url = new URL(
        trimmed,
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
      );
      const tokenParam = url.searchParams.get("t") || url.searchParams.get("token");
      if (tokenParam) return tokenParam.trim();
    }
  } catch {
    // If not a valid URL, treat as raw token
  }
  return trimmed;
}

/**
 * Synthesizes a Paytm/PhonePe style double-chime confirmation audio
 */
export function playPaytmChime(success = true) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (success) {
      // Pleasant double bell (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.18, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.45);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext blocked or unsupported
  }
}

export function QrCameraScanner({
  onScan,
  isProcessing = false,
  onSwitchToManual,
}: QrCameraScannerProps) {
  const containerId = "gym-qr-camera-reader";
  const [cameraState, setCameraState] = useState<
    "INITIALIZING" | "READY" | "ERROR" | "LOCKED"
  >("INITIALIZING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "PERMISSION_DENIED" | "NO_DEVICE" | "IN_USE" | "INSECURE_CONTEXT" | "GENERIC"
  >("GENERIC");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraCount, setCameraCount] = useState(1);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);

  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasDetectedRef = useRef<boolean>(false);

  // Initialize camera with robust multi-tiered fallback
  const startCamera = useCallback(
    async (cameraIndex = 0) => {
      setCameraState("INITIALIZING");
      setErrorMessage(null);
      hasDetectedRef.current = false;

      // 1. Check for Secure Context (HTTPS or localhost)
      if (
        typeof window !== "undefined" &&
        !window.isSecureContext &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        setCameraState("ERROR");
        setErrorType("INSECURE_CONTEXT");
        setErrorMessage(
          "Browsers block camera access over unencrypted HTTP (e.g. http://192.168.x.x). Please open via http://localhost:3000 or an HTTPS connection."
        );
        return;
      }

      // 2. Check navigator.mediaDevices support
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraState("ERROR");
        setErrorType("INSECURE_CONTEXT");
        setErrorMessage(
          "Camera streaming is not supported by your browser in this environment."
        );
        return;
      }

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        // Clean up previous instance if running
        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            await html5QrCodeRef.current.clear();
          } catch {
            // Cleanup error
          }
        }

        const scanner = new Html5Qrcode(containerId);
        html5QrCodeRef.current = scanner;

        const qrConfig = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const edge = Math.min(viewfinderWidth, viewfinderHeight) * 0.72;
            return { width: Math.round(edge), height: Math.round(edge) };
          },
          aspectRatio: 1.0,
        };

        const onScanSuccess = (decodedText: string) => {
          if (hasDetectedRef.current || isProcessing) return;
          hasDetectedRef.current = true;

          const extracted = extractQrToken(decodedText);
          setCameraState("LOCKED");

          playPaytmChime(true);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate([40, 20, 40]);
            } catch {}
          }

          onScan(extracted);
        };

        // Query physical cameras
        let cameras: Array<{ id: string; label: string }> = [];
        try {
          cameras = await Html5Qrcode.getCameras();
          setAvailableCameras(cameras);
          setCameraCount(cameras.length);
        } catch {
          // getCameras might throw before permissions are granted
        }

        // Tiered start strategy:
        let started = false;

        // Strategy A: If specific camera selected from list
        if (cameras.length > 0) {
          const targetCam = cameras[cameraIndex % cameras.length];
          if (targetCam) {
            try {
              await scanner.start(targetCam.id, qrConfig, onScanSuccess, () => {});
              started = true;
            } catch (err) {
              console.warn("Direct deviceId camera start failed, trying facingMode:", err);
            }
          }
        }

        // Strategy B: Try environment/back camera (default for mobile)
        if (!started) {
          try {
            await scanner.start(
              { facingMode: "environment" },
              qrConfig,
              onScanSuccess,
              () => {}
            );
            started = true;
          } catch (err) {
            console.warn("environment facingMode failed, trying user camera:", err);
          }
        }

        // Strategy C: Try user/front camera (default for laptops/desktops)
        if (!started) {
          try {
            await scanner.start(
              { facingMode: "user" },
              qrConfig,
              onScanSuccess,
              () => {}
            );
            started = true;
          } catch (err) {
            console.warn("user facingMode failed, trying generic video constraint:", err);
          }
        }

        // Strategy D: Plain video constraint without facingMode
        if (!started) {
          await scanner.start(
            true as any,
            qrConfig,
            onScanSuccess,
            () => {}
          );
        }

        // Check torch capabilities
        try {
          const videoTrack = (scanner as any).localMediaStream?.getVideoTracks()?.[0];
          const capabilities = videoTrack?.getCapabilities?.();
          if (capabilities && "torch" in capabilities) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }

        setCameraState("READY");
      } catch (err: unknown) {
        console.error("Camera scanner start failed:", err);
        setCameraState("ERROR");

        const msg = err instanceof Error ? err.message : String(err);
        const name = err instanceof Error ? err.name : "";

        if (
          name === "NotAllowedError" ||
          msg.includes("Permission") ||
          msg.includes("denied") ||
          msg.includes("NotAllowedError")
        ) {
          setErrorType("PERMISSION_DENIED");
          setErrorMessage(
            "Camera permission was blocked. Please click the camera/lock icon in your browser address bar to allow camera access."
          );
        } else if (
          name === "NotFoundError" ||
          name === "DevicesNotFoundError" ||
          msg.includes("NotFound")
        ) {
          setErrorType("NO_DEVICE");
          setErrorMessage(
            "No webcam or camera device was found connected to this computer."
          );
        } else if (
          name === "NotReadableError" ||
          name === "TrackStartError" ||
          msg.includes("in use") ||
          msg.includes("readable")
        ) {
          setErrorType("IN_USE");
          setErrorMessage(
            "Your camera is currently in use by another application (e.g. Zoom, Google Meet, Teams, or another browser tab)."
          );
        } else {
          setErrorType("GENERIC");
          setErrorMessage(
            msg || "Unable to access video stream on this device."
          );
        }
      }
    },
    [onScan, isProcessing]
  );

  useEffect(() => {
    startCamera(currentCameraIndex);

    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current.clear().catch(() => {});
        } catch {}
      }
    };
  }, [currentCameraIndex, startCamera]);

  // Flip / switch camera index
  const handleFlipCamera = () => {
    if (cameraCount > 1) {
      setCurrentCameraIndex((prev) => (prev + 1) % cameraCount);
    } else {
      startCamera(0);
    }
  };

  // Toggle flashlight
  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current) return;
    try {
      const videoTrack = (html5QrCodeRef.current as any).localMediaStream?.getVideoTracks()?.[0];
      if (videoTrack) {
        const nextState = !isTorchOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      }
    } catch (e) {
      console.warn("Torch toggle not supported:", e);
    }
  };

  // Scan screenshot of QR from gallery
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const fileScanner = new Html5Qrcode("gym-file-reader-temp");
      const decoded = await fileScanner.scanFile(file, false);
      const extracted = extractQrToken(decoded);
      fileScanner.clear();

      playPaytmChime(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([40, 20, 40]);
        } catch {}
      }

      onScan(extracted);
    } catch {
      playPaytmChime(false);
      setErrorMessage("No valid QR code could be found in that photo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-950 p-2 shadow-2xl border border-neutral-800">
      <div id="gym-file-reader-temp" className="hidden" />

      {/* Main Viewport */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
        <div
          id={containerId}
          className="h-full w-full object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
        />

        {/* Paytm/PhonePe Scanning Reticle */}
        {cameraState === "READY" && !isProcessing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

            <div className="relative h-64 w-64 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              <div className="absolute -top-1 -left-1 h-7 w-7 rounded-tl-xl border-t-4 border-l-4 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <div className="absolute -top-1 -right-1 h-7 w-7 rounded-tr-xl border-t-4 border-r-4 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <div className="absolute -bottom-1 -left-1 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

              <div className="absolute inset-x-2 animate-scan-laser h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_#34d399]" />
            </div>

            <div className="absolute bottom-5 flex items-center gap-1.5 rounded-full bg-black/75 px-3.5 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur-md border border-emerald-500/30">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Align QR code in frame</span>
            </div>
          </div>
        )}

        {/* Locked / Processing State */}
        {(cameraState === "LOCKED" || isProcessing) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-sm">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.4)] animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="mt-4 text-sm font-semibold text-white tracking-tight">
              QR Code Detected
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Acquiring GPS location &amp; verifying 50m geofence...
            </p>
          </div>
        )}

        {/* Initializing Spinner */}
        {cameraState === "INITIALIZING" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-neutral-400">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-400 mb-2" />
            <span className="text-xs font-medium">Starting camera...</span>
          </div>
        )}

        {/* Detailed Error Screen with Troubleshooting Guidance */}
        {cameraState === "ERROR" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 p-5 text-center text-neutral-300 overflow-y-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-2.5 border border-rose-500/30">
              {errorType === "PERMISSION_DENIED" ? (
                <Lock className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>

            <p className="text-xs font-bold text-white tracking-tight">
              {errorType === "PERMISSION_DENIED"
                ? "Camera Permission Blocked"
                : errorType === "NO_DEVICE"
                ? "No Camera Detected"
                : errorType === "IN_USE"
                ? "Camera In Use"
                : errorType === "INSECURE_CONTEXT"
                ? "HTTPS Connection Required"
                : "Unable to Access Camera"}
            </p>

            <p className="mt-1.5 text-[11px] text-neutral-300 leading-relaxed max-w-xs px-2">
              {errorMessage}
            </p>

            {/* Step-by-step guidance */}
            {errorType === "PERMISSION_DENIED" && (
              <div className="mt-2.5 rounded-xl bg-neutral-800/80 p-2.5 text-[10px] text-neutral-300 text-left border border-neutral-700/60 max-w-xs">
                <span className="font-semibold text-white block mb-1">To enable camera:</span>
                <ol className="list-decimal pl-3 space-y-0.5 text-neutral-400">
                  <li>Click the 🔒 or 📷 icon in your browser URL bar.</li>
                  <li>Toggle <strong>Camera</strong> to <strong>Allow</strong>.</li>
                  <li>Click <strong>Retry Camera</strong> below.</li>
                </ol>
              </div>
            )}

            {/* Error Actions */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => startCamera(currentCameraIndex)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 hover:text-white active:scale-95 transition-all shadow-sm"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry Camera</span>
              </button>

              {onSwitchToManual && (
                <button
                  type="button"
                  onClick={onSwitchToManual}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/20 active:scale-95 transition-all"
                >
                  <Keyboard className="h-3 w-3" />
                  <span>Manual Input</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Camera Toolbar */}
      <div className="mt-2.5 flex items-center justify-between px-3 py-1 text-white">
        <button
          type="button"
          onClick={handleFlipCamera}
          className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors border border-neutral-800 active:scale-95"
          title="Switch camera"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Switch Camera</span>
        </button>

        {hasTorch && (
          <button
            type="button"
            onClick={handleToggleTorch}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors border active:scale-95 ${
              isTorchOn
                ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                : "bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-800"
            }`}
          >
            <Flashlight className="h-3.5 w-3.5" />
            <span>{isTorchOn ? "Flash On" : "Flash"}</span>
          </button>
        )}

        <label
          htmlFor="gym-qr-upload"
          className="flex items-center gap-1.5 cursor-pointer rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors border border-neutral-800 active:scale-95"
          title="Upload QR photo"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload Image</span>
          <input
            id="gym-qr-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileScan}
          />
        </label>
      </div>
    </div>
  );
}
