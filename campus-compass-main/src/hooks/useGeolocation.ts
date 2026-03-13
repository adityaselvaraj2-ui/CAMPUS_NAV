import { useState, useEffect, useRef } from 'react';
import type { UserLocation } from '@/types/xr.types';

export function useGeolocation(enabled: boolean = false) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (enabled && !navigator.geolocation) setError('GPS not available on this device.');
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled]);

  return { location, error };
}
