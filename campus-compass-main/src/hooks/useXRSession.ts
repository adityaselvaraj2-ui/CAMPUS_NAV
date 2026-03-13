import { useState, useRef, useCallback } from 'react';

export type XRSessionType = 'immersive-vr' | 'immersive-ar' | 'inline';

export function useXRSession() {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState<Record<XRSessionType, boolean>>({
    'immersive-vr': false,
    'immersive-ar': false,
    'inline': true,
  });
  const sessionRef = useRef<any>(null);

  const checkSupport = useCallback(async () => {
    const xr = (navigator as any).xr;
    if (!xr) return;
    const types: XRSessionType[] = ['immersive-vr', 'immersive-ar'];
    const results: Record<string, boolean> = { inline: true };
    for (const type of types) {
      try {
        results[type] = await xr.isSessionSupported(type);
      } catch {
        results[type] = false;
      }
    }
    setIsSupported(results as Record<XRSessionType, boolean>);
  }, []);

  const endSession = useCallback(async () => {
    await sessionRef.current?.end();
    setIsActive(false);
    sessionRef.current = null;
  }, []);

  return { isActive, isSupported, sessionRef, checkSupport, endSession };
}
