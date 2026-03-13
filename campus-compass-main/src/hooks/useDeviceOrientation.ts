import { useState, useEffect, useCallback } from 'react';
import type { DeviceOrientation } from '@/types/xr.types';

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null, beta: null, gamma: null, absolute: false,
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        if (result === 'granted') setHasPermission(true);
        return result === 'granted';
      } catch {
        return false;
      }
    }
    setHasPermission(true);
    return true;
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    const handler = (e: DeviceOrientationEvent) => {
      setOrientation({
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
        absolute: e.absolute ?? false,
      });
    };
    window.addEventListener('deviceorientationabsolute', handler as EventListener, true);
    window.addEventListener('deviceorientation', handler, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler as EventListener, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, [hasPermission]);

  return { orientation, hasPermission, isSupported, requestPermission };
}
