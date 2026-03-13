import { useState } from 'react';
import { Campus, Building } from '@/data/campusData';
import { Glasses, Camera, Map, Building2, Cpu, Images } from 'lucide-react';
import type { XRMode } from '@/types/xr.types';
import ARCameraView from './ar/ARCameraView';
import ARIndoorView from './ar/ARIndoorView';
import VRCampusTour from './vr/VRCampusTour';
import PanoramaTour from './panorama/PanoramaTour';

interface ARVRTabProps {
  campus: Campus;
}

interface XRModeCard {
  id: XRMode;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  requirements: string[];
  isNew?: boolean;
  sjceOnly?: boolean;
}

const XR_MODES: XRModeCard[] = [
  {
    id: 'ar-outdoor',
    icon: Camera,
    title: 'AR OUTDOOR',
    subtitle: 'Campus Navigator',
    description: 'Point your camera at the campus. Building labels float in real space with live distance, status, and directions.',
    badge: 'LIVE AR',
    badgeColor: 'hsl(var(--aurora-3))',
    gradient: 'from-accent/10 to-transparent',
    requirements: ['Camera', 'Compass', 'GPS (optional)'],
  },
  {
    id: 'ar-indoor',
    icon: Map,
    title: 'AR INDOOR',
    subtitle: 'Floor Plan Overlay',
    description: 'See ghost floor plans overlaid on camera feed. Navigate hallways with an X-ray view of room layouts.',
    badge: 'BETA',
    badgeColor: 'hsl(var(--solar))',
    gradient: 'from-yellow-500/10 to-transparent',
    requirements: ['Camera', 'Gyroscope'],
  },
  {
    id: 'vr-campus',
    icon: Building2,
    title: 'VR CAMPUS TOUR',
    subtitle: '3D Digital Twin',
    description: 'Explore the entire campus as a 3D model built from real GPS coordinates. Orbit, zoom, and click any building.',
    badge: 'WEBXR',
    badgeColor: 'hsl(var(--aurora-2))',
    gradient: 'from-secondary/10 to-transparent',
    requirements: ['WebGL', 'WebXR (optional)'],
  },
  {
    id: 'panorama-360',
    icon: Images,
    title: '360° PANORAMA',
    subtitle: 'Real Campus Photos',
    description: 'Immersive 360° real photos from 6 iconic SJCE locations — drag, gyro-tilt, pinch-to-zoom. WebGL rendered, works offline.',
    badge: 'REAL PHOTOS',
    badgeColor: 'hsl(var(--aurora-1))',
    gradient: 'from-primary/10 to-transparent',
    requirements: ['WebGL', 'Gyroscope (optional)'],
    isNew: true,
    sjceOnly: true,
  },
];

const ARVRTab = ({ campus }: ARVRTabProps) => {
  const [activeMode, setActiveMode] = useState<XRMode>('idle');
  const [, setSelectedBuilding] = useState<Building | null>(null);

  if (activeMode === 'ar-outdoor') {
    return (
      <div className="fixed inset-0 z-[2000]">
        <ARCameraView
          campus={campus}
          onSelectBuilding={setSelectedBuilding}
          onExit={() => setActiveMode('idle')}
        />
      </div>
    );
  }
  if (activeMode === 'ar-indoor') {
    return (
      <div className="fixed inset-0 z-[2000]">
        <ARIndoorView campus={campus} onExit={() => setActiveMode('idle')} />
      </div>
    );
  }
  if (activeMode === 'vr-campus') {
    return (
      <div className="fixed inset-0 z-[2000]">
        <VRCampusTour
          campus={campus}
          onSelectBuilding={setSelectedBuilding}
          onExit={() => setActiveMode('idle')}
        />
      </div>
    );
  }
  if (activeMode === 'panorama-360') {
    return (
      <div className="w-full">
        <PanoramaTour
          campusId={campus.shortName}
          onExit={() => setActiveMode('idle')}
        />
      </div>
    );
  }

  // Visible modes — hide panorama-360 card for non-SJCE campuses
  const visibleModes = XR_MODES.filter(
    (m) => !m.sjceOnly || campus.shortName === 'SJCE',
  );

  return (
    <div className="tab-enter max-w-5xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-12 animate-fade-up">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
            <Glasses className="w-6 h-6 text-secondary" />
          </div>
          <div className="text-left">
            <div className="font-ui text-xs tracking-widest text-muted-foreground">IMMERSIVE REALITY</div>
            <div className="font-display text-2xl font-black">AR / VR SUITE</div>
          </div>
        </div>
        <p className="font-body text-muted-foreground max-w-lg mx-auto">
          Experience {campus.shortName} beyond the map. Real-time AR overlays, GPS-powered building labels, and an immersive 3D digital twin built from verified campus coordinates.
        </p>

        {/* Campus badge */}
        <div className="inline-flex items-center gap-2 mt-4 glass-card px-4 py-2"
          style={{ borderColor: `${campus.color}40` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: campus.color }} />
          <span className="font-ui text-[10px] tracking-widest" style={{ color: campus.color }}>
            {campus.name.toUpperCase()}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            · {campus.buildings.length} BUILDINGS MAPPED
          </span>
        </div>
      </div>

      {/* Mode cards */}
      <div className={`grid gap-6 mb-8 ${visibleModes.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
        {visibleModes.map((mode, i) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              className="animate-fade-up glass-card p-6 cursor-pointer group
                         hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                         active:translate-y-0 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${i * 120}ms` }}
              onClick={() => setActiveMode(mode.id)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Badge row */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${mode.badgeColor}15`, border: `1px solid ${mode.badgeColor}30` }}>
                  <Icon className="w-5 h-5" style={{ color: mode.badgeColor }} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[9px] px-2 py-1 rounded-md"
                    style={{ color: mode.badgeColor, background: `${mode.badgeColor}15`, border: `1px solid ${mode.badgeColor}30` }}>
                    {mode.badge}
                  </span>
                  {mode.isNew && (
                    <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-md animate-pulse"
                      style={{ color: '#FFD166', background: '#FFD16620', border: '1px solid #FFD16640' }}>
                      NEW
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="font-ui text-sm font-bold tracking-wider mb-1">{mode.title}</div>
                <div className="font-body text-[10px] text-muted-foreground mb-3 uppercase tracking-wider">{mode.subtitle}</div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{mode.description}</p>

                {/* Requirements */}
                <div className="flex flex-wrap gap-1.5">
                  {mode.requirements.map(req => (
                    <span key={req} className="font-mono text-[8px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Launch arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-ui text-xs" style={{ color: mode.badgeColor }}>LAUNCH →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="glass-card p-4 flex items-start gap-3 animate-fade-up" style={{ animationDelay: '400ms' }}>
        <Cpu className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-ui text-[10px] tracking-widest text-muted-foreground mb-1">TECHNOLOGY</div>
          <p className="font-body text-xs text-muted-foreground">
            All experiences are powered by native browser APIs — no app download required.
            AR modes use your device camera and compass. The VR campus is a 3D model
            generated in real-time from the same GPS coordinates used in the map view.
            WebXR headsets (Meta Quest, etc.) are supported when available.
            The 360° Panorama Tour is exclusively for SJCE with real on-campus photos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ARVRTab;
