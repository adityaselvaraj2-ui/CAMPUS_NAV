import { useRef, useEffect, useState } from 'react';
import { Campus } from '@/data/campusData';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface ARIndoorViewProps {
  campus: Campus;
  onExit: () => void;
}

const FLOOR_PLANS: Record<string, { label: string; rooms: { id: string; x: number; y: number; w: number; h: number; label: string; type: string }[] }> = {
  library: {
    label: 'Central Library',
    rooms: [
      { id: 'entrance', x: 200, y: 340, w: 100, h: 50, label: 'Entrance', type: 'corridor' },
      { id: 'issue', x: 200, y: 270, w: 100, h: 60, label: 'Issue Counter', type: 'facility' },
      { id: 'reading1', x: 50, y: 120, w: 160, h: 140, label: 'Reading Hall A', type: 'classroom' },
      { id: 'reading2', x: 290, y: 120, w: 160, h: 140, label: 'Reading Hall B', type: 'classroom' },
      { id: 'digital', x: 140, y: 20, w: 220, h: 80, label: 'Digital Library', type: 'lab' },
      { id: 'stairs', x: 20, y: 300, w: 50, h: 60, label: 'Stairs', type: 'stairs' },
    ],
  },
  cse: {
    label: 'CSE Block',
    rooms: [
      { id: 'lobby', x: 180, y: 340, w: 140, h: 50, label: 'Main Lobby', type: 'corridor' },
      { id: 'lab1', x: 30, y: 200, w: 180, h: 120, label: 'Lab 1', type: 'lab' },
      { id: 'lab2', x: 290, y: 200, w: 180, h: 120, label: 'Lab 2', type: 'lab' },
      { id: 'class1', x: 30, y: 50, w: 140, h: 120, label: 'Room 301', type: 'classroom' },
      { id: 'class2', x: 330, y: 50, w: 140, h: 120, label: 'Room 302', type: 'classroom' },
      { id: 'faculty', x: 200, y: 80, w: 100, h: 80, label: 'Faculty Room', type: 'faculty' },
      { id: 'stairs', x: 20, y: 340, w: 50, h: 50, label: 'Stairs', type: 'stairs' },
    ],
  },
  admin: {
    label: 'Admin Block',
    rooms: [
      { id: 'reception', x: 180, y: 320, w: 140, h: 70, label: 'Reception', type: 'facility' },
      { id: 'principal', x: 60, y: 100, w: 160, h: 120, label: "Principal's Office", type: 'faculty' },
      { id: 'registrar', x: 280, y: 100, w: 160, h: 120, label: 'Registrar', type: 'facility' },
      { id: 'accounts', x: 280, y: 240, w: 160, h: 70, label: 'Accounts', type: 'facility' },
      { id: 'exam', x: 60, y: 240, w: 160, h: 70, label: 'Exam Cell', type: 'facility' },
      { id: 'stairs', x: 20, y: 350, w: 50, h: 40, label: 'Stairs', type: 'stairs' },
    ],
  },
};

const ROOM_COLORS: Record<string, string> = {
  classroom: 'hsl(var(--aurora-1))',
  lab: 'hsl(var(--aurora-1))',
  faculty: 'hsl(var(--solar))',
  facility: 'hsl(var(--aurora-3))',
  corridor: 'hsl(var(--text-3))',
  stairs: 'hsl(var(--foreground))',
};

const ARIndoorView = ({ campus, onExit }: ARIndoorViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { orientation, requestPermission } = useDeviceOrientation();
  const [opacity, setOpacity] = useState(0.4);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('library');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraError('Camera access denied.');
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const parallaxX = (orientation.gamma ?? 0) * 0.3;
  const parallaxY = ((orientation.beta ?? 45) - 45) * 0.3;
  const plan = FLOOR_PLANS[selectedBuilding];

  if (cameraError) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="text-4xl mb-4">📷</div>
          <h3 className="font-ui text-sm tracking-wider text-nova mb-2">CAMERA UNAVAILABLE</h3>
          <p className="font-body text-sm text-text-2 mb-6">{cameraError}</p>
          <button onClick={onExit} className="glass-card px-6 py-2 font-ui text-xs text-text-2 hover:text-primary transition-all">
            ← RETURN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

      {/* Ghost floor plan SVG overlay */}
      {plan && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${parallaxX}px, ${parallaxY}px)`,
            transition: 'transform 80ms linear',
          }}
        >
          <svg viewBox="0 0 500 400" className="w-full h-full" style={{ opacity }}>
            {plan.rooms.map(room => (
              <g key={room.id}>
                <rect
                  x={room.x} y={room.y} width={room.w} height={room.h}
                  fill={`${ROOM_COLORS[room.type] || 'hsl(var(--aurora-1))'}`.replace(')', '/0.08)')}
                  stroke={ROOM_COLORS[room.type] || 'hsl(var(--aurora-1))'}
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                  strokeOpacity={0.6}
                  rx="3"
                />
                <text
                  x={room.x + room.w / 2} y={room.y + room.h / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fillOpacity={0.7}
                  fontSize="10" fontFamily="Orbitron, sans-serif"
                >
                  {room.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Opacity slider */}
      <div className="absolute bottom-24 left-4 right-4 flex items-center gap-3 z-50">
        <span className="font-ui text-[9px] text-text-3">OVERLAY</span>
        <input
          type="range" min="0.1" max="0.8" step="0.05"
          value={opacity}
          onChange={e => setOpacity(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="font-mono text-[9px] text-text-3">{Math.round(opacity * 100)}%</span>
      </div>

      {/* Building selector chips */}
      <div className="absolute top-16 left-4 right-4 flex gap-2 overflow-x-auto z-50">
        {Object.entries(FLOOR_PLANS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setSelectedBuilding(key)}
            className={`glass-card px-3 py-1.5 font-ui text-[9px] whitespace-nowrap transition-all
              ${selectedBuilding === key ? 'border-primary/40 text-primary' : 'text-text-3'}`}
          >
            {val.label.toUpperCase()}
          </button>
        ))}
      </div>

      <button onClick={onExit} className="absolute top-4 left-4 glass-card px-4 py-2 font-ui text-xs text-text-2 z-50 hover:text-primary transition-all">
        ← EXIT AR
      </button>
    </div>
  );
};

export default ARIndoorView;
