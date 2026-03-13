import { useRef, useEffect, useState, useMemo } from 'react';
import { Campus, Building, getBuildingStatus } from '@/data/campusData';
import { haversineDistance, computeBearing, bearingToScreenX, tiltToScreenY, formatDistance } from '@/utils/spatialMath';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { ARBuildingOverlay } from '@/types/xr.types';

interface ARCameraViewProps {
  campus: Campus;
  onSelectBuilding: (building: Building) => void;
  onExit: () => void;
}

const ARCameraView = ({ campus, onSelectBuilding, onExit }: ARCameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { orientation, hasPermission, requestPermission } = useDeviceOrientation();
  const [gpsActive, setGpsActive] = useState(false);
  const { location } = useGeolocation(gpsActive);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } catch {
        setCameraError('Camera access denied. Enable camera permissions to use AR mode.');
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  // Auto-request compass permission
  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // AR overlay computation — reads campus.buildings lat/lng (READ ONLY)
  const overlays = useMemo<ARBuildingOverlay[]>(() => {
    const compassHeading = orientation.alpha ?? 0;
    const deviceTilt = orientation.beta ?? 45;
    const userLat = location?.lat ?? campus.center[0];
    const userLng = location?.lng ?? campus.center[1];

    return campus.buildings
      .map(building => {
        const distance = haversineDistance(userLat, userLng, building.lat, building.lng);
        const bearing = computeBearing(userLat, userLng, building.lat, building.lng);
        const screenX = bearingToScreenX(compassHeading, bearing, 70);
        if (screenX === null) return null;
        const screenY = tiltToScreenY(deviceTilt, distance);
        const statusInfo = getBuildingStatus(building);

        return {
          buildingId: building.id,
          buildingName: building.name,
          buildingIcon: building.icon,
          screenX,
          screenY,
          distance,
          bearing,
          status: statusInfo.status,
          statusLabel: statusInfo.label,
          category: building.category,
        } as ARBuildingOverlay;
      })
      .filter(Boolean)
      .sort((a, b) => b!.distance - a!.distance) as ARBuildingOverlay[];
  }, [campus.buildings, campus.center, orientation, location]);

  if (cameraError) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="text-4xl mb-4">📷</div>
          <h3 className="font-ui text-sm tracking-wider text-nova mb-2">CAMERA UNAVAILABLE</h3>
          <p className="font-body text-sm text-text-2 mb-6">{cameraError}</p>
          <button onClick={onExit} className="glass-card px-6 py-2 font-ui text-xs tracking-wider text-text-2 hover:text-primary transition-all">
            ← RETURN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* AR HUD overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizon line */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${50 + (45 - (orientation.beta ?? 45)) * 1.2}%`,
            background: 'linear-gradient(90deg, transparent, hsl(var(--aurora-1)/0.4), transparent)',
          }}
        />

        {/* Compass rose */}
        <ARCompassRose heading={orientation.alpha ?? 0} />

        {/* Building AR labels */}
        {overlays.map(overlay => (
          <ARBuildingLabel
            key={overlay.buildingId}
            overlay={overlay}
            isSelected={selectedOverlay === overlay.buildingId}
            onTap={() => {
              setSelectedOverlay(overlay.buildingId);
              const building = campus.buildings.find(b => b.id === overlay.buildingId);
              if (building) onSelectBuilding(building);
            }}
          />
        ))}

        {/* GPS accuracy */}
        {location && (
          <div className="absolute bottom-20 left-4 glass-card px-3 py-1.5 text-[10px] font-mono text-accent pointer-events-none">
            📍 GPS ±{Math.round(location.accuracy)}m
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-50">
        <button onClick={onExit} className="glass-card px-4 py-2 font-ui text-xs text-text-2 hover:text-primary transition-all">
          ← EXIT AR
        </button>
        {!gpsActive && (
          <button
            onClick={async () => {
              await requestPermission();
              setGpsActive(true);
            }}
            className="glass-card px-4 py-2 font-ui text-xs text-accent hover:-translate-y-0.5 transition-all"
          >
            ENABLE GPS
          </button>
        )}
        <div className="glass-card px-3 py-2 font-mono text-[10px] text-text-3">
          {overlays.length} VISIBLE
        </div>
      </div>
    </div>
  );
};

// Individual floating AR label
const ARBuildingLabel = ({ overlay, isSelected, onTap }: {
  overlay: ARBuildingOverlay;
  isSelected: boolean;
  onTap: () => void;
}) => {
  const statusColorMap: Record<string, string> = {
    open: 'hsl(var(--aurora-3))',
    closing: 'hsl(var(--solar))',
    closed: 'hsl(var(--nova))',
    always: 'hsl(var(--aurora-3))',
    restricted: 'hsl(var(--solar))',
  };
  const statusColor = statusColorMap[overlay.status] || 'hsl(var(--aurora-1))';
  const scale = Math.max(0.6, Math.min(1.2, 200 / overlay.distance));

  return (
    <div
      className="absolute pointer-events-auto cursor-pointer"
      style={{
        left: `${overlay.screenX}%`,
        top: `${overlay.screenY}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: Math.round(1000 - overlay.distance),
        filter: isSelected ? `drop-shadow(0 0 16px ${statusColor})` : 'none',
        transition: 'all 120ms ease-out',
      }}
      onClick={onTap}
    >
      {/* Connector line */}
      <div
        className="absolute left-1/2 top-full"
        style={{
          width: '1px',
          height: `${Math.min(overlay.distance / 5, 60)}px`,
          background: `linear-gradient(${statusColor}, transparent)`,
          transform: 'translateX(-50%)',
          opacity: 0.6,
        }}
      />

      {/* Label card */}
      <div
        className="glass-card px-3 py-2 flex items-center gap-2 whitespace-nowrap"
        style={{
          borderColor: `${statusColor}40` as any,
          boxShadow: `0 0 20px ${statusColor}20`,
        }}
      >
        <span className="text-sm">{overlay.buildingIcon}</span>
        <div>
          <div className="font-ui text-[9px] tracking-wider text-foreground">{overlay.buildingName}</div>
          <div className="font-mono text-[8px] flex items-center gap-1.5 mt-0.5">
            <span style={{ color: statusColor }}>●</span>
            <span className="text-muted-foreground">{overlay.statusLabel}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground/60">{formatDistance(overlay.distance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compass rose
const ARCompassRose = ({ heading }: { heading: number }) => (
  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-8 glass-card overflow-hidden pointer-events-none">
    <div
      className="flex items-center h-full"
      style={{
        transform: `translateX(calc(-50% + 96px - ${heading / 360 * 480}px))`,
        width: '480px',
        transition: 'transform 80ms linear',
      }}
    >
      {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'].map((dir, i) => (
        <div key={i} className="w-[60px] text-center font-ui text-[9px]"
          style={{ color: dir === 'N' ? 'hsl(var(--nova))' : 'hsl(var(--text-3))' }}>
          {dir}
        </div>
      ))}
    </div>
    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/60" />
  </div>
);

export default ARCameraView;
