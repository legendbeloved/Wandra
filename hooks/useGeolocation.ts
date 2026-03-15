"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeoLocation {
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // For programmatic manual fetching as well
  const getCurrentLocation = useCallback((): Promise<GeoLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          timestamp: pos.timestamp
        }),
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });
  }, []);

  return { location, error, getCurrentLocation };
}
