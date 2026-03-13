import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SJCE_LOCATIONS, FEATURE_PILLS, type PanoramaLocation } from './panoramaData';
import { getPanoramaImage, getPlaceholderImage } from './panoramaImages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PanoramaTourProps {
  campusId: string;
  onExit?: () => void;
}

// ─── Campus guard screen ──────────────────────────────────────────────────────

const CampusBlockedScreen: React.FC<{ campusId: string }> = ({ campusId }) => (
  <div className="tab-enter max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-8">
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
      style={{ background: 'hsl(var(--destructive) / 0.15)', border: '1px solid hsl(var(--destructive) / 0.4)' }}>
      🔒
    </div>
    <div className="text-center">
      <div className="font-mono text-sm tracking-[0.3em] mb-2"
        style={{ color: 'hsl(var(--destructive))' }}>
        ACCESS RESTRICTED
      </div>
      <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
        The 360° Panorama Tour is exclusively available for SJCE campus.
        <span className="block mt-1" style={{ color: 'hsl(var(--destructive))' }}>
          {campusId} campus access is blocked.
        </span>
      </p>
    </div>

    {/* Status comparison */}
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
      <div className="glass-card p-4 text-center border-green-500/30">
        <div className="text-2xl mb-2">✅</div>
        <div className="font-ui text-xs tracking-widest text-green-400 mb-1">SJCE</div>
        <div className="font-mono text-[9px] text-muted-foreground">AVAILABLE · 6 LOCATIONS</div>
      </div>
      <div className="glass-card p-4 text-center"
        style={{ borderColor: 'hsl(var(--destructive) / 0.3)' }}>
        <div className="text-2xl mb-2">🚫</div>
        <div className="font-mono text-xs tracking-widest mb-1"
          style={{ color: 'hsl(var(--destructive))' }}>
          {campusId}
        </div>
        <div className="font-mono text-[9px] text-muted-foreground">BLOCKED · NOT AVAILABLE</div>
      </div>
    </div>
  </div>
);

// ─── Loading overlay ──────────────────────────────────────────────────────────

const LoadingOverlay: React.FC<{ locationName: string; color: string }> = ({ locationName, color }) => (
  <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-5">
    <div
      className="w-14 h-14 rounded-full border-4 border-transparent"
      style={{
        borderTopColor: color,
        animation: 'spin 0.9s linear infinite',
      }}
    />
    <div className="font-mono text-[11px] tracking-[0.25em]" style={{ color }}>
      LOADING 360° · {locationName.toUpperCase()}
    </div>
  </div>
);

// ─── Main viewer ──────────────────────────────────────────────────────────────

interface ViewerProps {
  location: PanoramaLocation;
  onExit: () => void;
  onNavigate: (id: string) => void;
}

const PanoramaViewer: React.FC<ViewerProps> = ({ location, onExit, onNavigate }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animIdRef = useRef<number>(0);

  // Spherical coords (never setState — refs only for 60fps perf)
  const thetaRef = useRef(0);
  const phiRef = useRef(Math.PI / 2);
  const fovRef = useRef(75);

  // Drag state
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  // Gyro state
  const gyroActiveRef = useRef(false);
  const gyroOffsetRef = useRef<number | null>(null);

  // Pinch state
  const pinchDistRef = useRef<number | null>(null);

  // UI state (needs re-render so useState is fine here — not in rAF loop)
  const [isLoading, setIsLoading] = useState(true);
  const [gyroOn, setGyroOn] = useState(false);
  const [fps, setFps] = useState(0);

  // ── Gyro handler ──────────────────────────────────────────────────────────
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (!gyroActiveRef.current) return;
    const alpha = e.alpha ?? 0;
    const beta = e.beta ?? 0;
    if (gyroOffsetRef.current === null) gyroOffsetRef.current = alpha;
    const adjustedAlpha = alpha - gyroOffsetRef.current;
    thetaRef.current = -(adjustedAlpha * Math.PI) / 180;
    const rawPhi = ((90 - beta) * Math.PI) / 180;
    phiRef.current = Math.max(0.1, Math.min(Math.PI - 0.1, rawPhi));
  }, []);

  const removeGyroListeners = useCallback(() => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [handleOrientation]);

  const addGyroListeners = useCallback(() => {
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
  }, [handleOrientation]);

  const toggleGyro = useCallback(async () => {
    if (gyroOn) {
      gyroActiveRef.current = false;
      gyroOffsetRef.current = null;
      removeGyroListeners();
      setGyroOn(false);
      return;
    }
    // iOS requires explicit permission — `any` is required here because
    // DeviceOrientationEvent.requestPermission is iOS-only and not in the
    // standard TypeScript lib. There is no typed alternative.
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const result = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (result !== 'granted') return;
      } catch {
        return;
      }
    }
    gyroOffsetRef.current = null;
    gyroActiveRef.current = true;
    addGyroListeners();
    setGyroOn(true);
  }, [gyroOn, addGyroListeners, removeGyroListeners]);

  // ── Main Three.js effect ──────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.set(0, 0, 0.01);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    (renderer as THREE.WebGLRenderer & { powerPreference: string }).powerPreference = 'high-performance';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sphere geometry
    const geo = new THREE.SphereGeometry(500, 64, 32);
    const mat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Load texture
    const loader = new THREE.TextureLoader();
    let disposed = false;

    const applyTexture = (tex: THREE.Texture) => {
      if (disposed) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      mat.map = tex;
      mat.needsUpdate = true;
      setIsLoading(false);
    };

    const loadUrl = (url: string) => {
      loader.load(url, applyTexture, undefined, () => {
        loader.load(getPlaceholderImage(location.id), applyTexture, undefined, () => {
          if (!disposed) setIsLoading(false);
        });
      });
    };

    // getPanoramaImage returns cached URL immediately if ready, or placeholder
    // and calls onReady when the real image is extracted from the zip
    const initialUrl = getPanoramaImage(location.id, (realUrl) => {
      if (!disposed) loadUrl(realUrl);
    });
    loadUrl(initialUrl);

    // FPS counter
    let frameCount = 0;
    let lastFpsTime = performance.now();

    // Render loop — ZERO setState calls here
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);

      // Auto-rotate when idle
      if (!isDraggingRef.current && !gyroActiveRef.current) {
        thetaRef.current += 0.0003;
      }

      // Clamp phi
      phiRef.current = Math.max(0.1, Math.min(Math.PI - 0.1, phiRef.current));
      // Apply FOV
      camera.fov = fovRef.current;
      camera.updateProjectionMatrix();

      const phi = phiRef.current;
      const theta = thetaRef.current;
      camera.lookAt(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      );

      renderer.render(scene, camera);

      // FPS update once per second
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }
    };
    animate();

    // Resize handler
    const onResize = () => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    // Cleanup — CRITICAL for GPU memory
    return () => {
      disposed = true;
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', onResize);
      removeGyroListeners();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      rendererRef.current = null;
    };
    // location.id change triggers a full re-mount (texture swap)
  }, [location.id, removeGyroListeners]);

  // ── Pointer events ────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    thetaRef.current -= dx * 0.004;
    phiRef.current -= dy * 0.004;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // ── Wheel zoom ────────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    fovRef.current = Math.max(30, Math.min(100, fovRef.current + e.deltaY * 0.05));
  }, []);

  // ── Touch pinch ───────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2 || pinchDistRef.current === null) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const newDist = Math.sqrt(dx * dx + dy * dy);
    const delta = pinchDistRef.current - newDist;
    fovRef.current = Math.max(30, Math.min(100, fovRef.current + delta * 0.05));
    pinchDistRef.current = newDist;
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchDistRef.current = null;
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Three.js mount */}
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay locationName={location.name} color={location.color} />}

      {/* Crosshair — pointer-events none */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-10 h-10">
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-px"
            style={{ background: location.color, opacity: 0.6 }} />
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-px"
            style={{ background: location.color, opacity: 0.6 }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border"
            style={{ borderColor: location.color, opacity: 0.4 }} />
        </div>
      </div>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <div className="h-full flex items-start justify-between px-4 pt-3 pointer-events-auto">
          {/* Exit */}
          <button
            onClick={onExit}
            className="glass-card px-4 py-2 font-ui text-xs text-muted-foreground hover:text-primary transition-all">
            ← EXIT 360°
          </button>

          {/* Location badge */}
          <div className="glass-card px-4 py-2 flex items-center gap-2"
            style={{ borderColor: `${location.color}50` }}>
            <span className="text-lg leading-none">{location.icon}</span>
            <div className="text-center">
              <div className="font-ui text-[11px] font-bold tracking-wider" style={{ color: location.color }}>
                {location.name.toUpperCase()}
              </div>
              <div className="font-mono text-[8px] text-muted-foreground">{location.sublabel}</div>
            </div>
          </div>

          {/* Gyro + FPS */}
          <div className="flex items-center gap-2">
            <button
              aria-label={gyroOn ? 'Disable gyroscope' : 'Enable gyroscope'}
              onClick={toggleGyro}
              className="glass-card px-3 py-2 font-mono text-[9px] tracking-wider transition-all"
              style={gyroOn ? { color: location.color, borderColor: `${location.color}60` } : undefined}>
              {gyroOn ? '📡 GYRO ON' : '📱 USE GYRO'}
            </button>
            <div className="glass-card px-2 py-1 font-mono text-[9px] text-muted-foreground">
              {fps} FPS
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hint pill */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="glass-card px-4 py-2 font-ui text-[9px] tracking-wider text-muted-foreground whitespace-nowrap">
          {gyroOn
            ? 'TILT YOUR DEVICE TO LOOK AROUND · PINCH TO ZOOM'
            : 'DRAG TO LOOK AROUND · SCROLL TO ZOOM'}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 glass-card">
        {SJCE_LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            aria-label={`Navigate to ${loc.name}`}
            onClick={() => onNavigate(loc.id)}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all hover:scale-105"
            style={
              loc.id === location.id
                ? { background: `${loc.color}20`, border: `1px solid ${loc.color}80` }
                : { border: '1px solid transparent' }
            }>
            <span className="text-base leading-none">{loc.icon}</span>
            <span className="font-mono text-[7px] text-muted-foreground max-w-[48px] text-center leading-tight truncate">
              {loc.name.split(' ')[0].toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Selection Hub ────────────────────────────────────────────────────────────

interface HubProps {
  onEnter: (id: string) => void;
  onExit?: () => void;
}

const SelectionHub: React.FC<HubProps> = ({ onEnter, onExit }) => (
  <div className="tab-enter max-w-5xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="text-center mb-10 animate-fade-up">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'hsl(var(--aurora-1) / 0.1)', border: '1px solid hsl(var(--aurora-1) / 0.3)' }}>
          🌐
        </div>
        <div className="text-left">
          <div className="font-ui text-xs tracking-widest text-muted-foreground">SJCE CAMPUS · REAL PHOTOS</div>
          <div className="font-display text-2xl font-black">360° PANORAMA TOUR</div>
        </div>
      </div>
      <p className="font-body text-muted-foreground text-sm max-w-lg mx-auto">
        Explore six iconic SJCE locations in immersive 360° — WebGL rendered, gyroscope-ready, works offline.
      </p>
      {onExit && (
        <button onClick={onExit} className="mt-4 font-ui text-xs text-muted-foreground hover:text-primary transition-colors">
          ← BACK TO AR/VR SUITE
        </button>
      )}
    </div>

    {/* Feature pills */}
    <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-up" style={{ animationDelay: '80ms' }}>
      {FEATURE_PILLS.map((pill) => (
        <span key={pill} className="font-mono text-[9px] px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
          {pill}
        </span>
      ))}
    </div>

    {/* Grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {SJCE_LOCATIONS.map((loc, i) => (
        <div
          key={loc.id}
          className="animate-fade-up glass-card p-5 cursor-pointer group relative overflow-hidden
                     hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                     active:translate-y-0 transition-all duration-300"
          style={{ animationDelay: `${i * 90}ms` }}
          onClick={() => onEnter(loc.id)}
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${loc.color}, transparent)` }} />

          {/* Radial glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top, ${loc.color}1f 0%, transparent 70%)` }} />

          {/* "360° LIVE" badge */}
          <div className="absolute top-3 right-3 font-mono text-[8px] px-2 py-0.5 rounded-md"
            style={{ color: loc.color, background: `${loc.color}1a`, border: `1px solid ${loc.color}40` }}>
            360° LIVE
          </div>

          {/* Icon circle */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 relative z-10"
            style={{ background: `${loc.color}1a`, border: `1px solid ${loc.color}40` }}>
            {loc.icon}
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="font-ui text-sm font-bold tracking-wider mb-0.5">{loc.name.toUpperCase()}</div>
            <div className="font-mono text-[9px] text-muted-foreground mb-2 uppercase tracking-wider">{loc.sublabel}</div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3">{loc.description}</p>
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {loc.tags.map((tag) => (
                <span key={tag} className="font-mono text-[7px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Launch text — hover only */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity font-ui text-[10px]"
            style={{ color: loc.color }}>
            ▶ ENTER 360° VIEW
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Root component ───────────────────────────────────────────────────────────

const PanoramaTour: React.FC<PanoramaTourProps> = ({ campusId, onExit }) => {
  // Campus guard — short-circuit BEFORE any Three.js init or base64 decode
  if (campusId !== 'SJCE') {
    return <CampusBlockedScreen campusId={campusId} />;
  }

  return <PanoramaInner onExit={onExit} />;
};

// Separate inner component so the guard above can fully prevent hooks from
// being called when campus is not SJCE.
const PanoramaInner: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeLocation = SJCE_LOCATIONS.find((l) => l.id === activeId) ?? null;

  if (activeLocation) {
    return (
      <div className="w-full" style={{ height: 'calc(100vh - 70px)' }}>
        <PanoramaViewer
          location={activeLocation}
          onExit={() => setActiveId(null)}
          onNavigate={setActiveId}
        />
      </div>
    );
  }

  return <SelectionHub onEnter={setActiveId} onExit={onExit} />;
};

export default PanoramaTour;
