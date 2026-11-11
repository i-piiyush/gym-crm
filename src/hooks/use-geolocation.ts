"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isLoading: false,
    error: null,
  });

  const requestCoordinates = useCallback(
    (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !navigator.geolocation) {
          const err = "Geolocation is not supported by your browser.";
          setState((s) => ({ ...s, error: err, isLoading: false }));
          return reject(new Error(err));
        }

        if (!window.isSecureContext && window.location.hostname !== "localhost") {
          const err = "Geolocation requires a secure context (HTTPS).";
          setState((s) => ({ ...s, error: err, isLoading: false }));
          return reject(new Error(err));
        }

        setState((s) => ({ ...s, isLoading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const result = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };

            setState({
              latitude: result.latitude,
              longitude: result.longitude,
              accuracy: result.accuracy,
              isLoading: false,
              error: null,
            });

            resolve(result);
          },
          (err) => {
            let message = "Unable to retrieve your location.";
            switch (err.code) {
              case err.PERMISSION_DENIED:
                message =
                  "Location permission was denied. Please allow location access in your browser or device settings to check in.";
                break;
              case err.POSITION_UNAVAILABLE:
                message =
                  "GPS position unavailable. Please ensure location services are enabled on your device.";
                break;
              case err.TIMEOUT:
                message =
                  "Location request timed out. Please ensure you have a clear GPS signal and try again.";
                break;
            }

            setState((s) => ({ ...s, isLoading: false, error: message }));
            reject(new Error(message));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    },
    []
  );

  const setManualCoordinates = useCallback(
    (latitude: number, longitude: number, accuracy: number) => {
      setState({
        latitude,
        longitude,
        accuracy,
        isLoading: false,
        error: null,
      });
    },
    []
  );

  return {
    ...state,
    requestCoordinates,
    setManualCoordinates,
  };
}

