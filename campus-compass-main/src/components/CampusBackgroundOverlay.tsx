import { useEffect, useState } from 'react';
import { Campus } from '@/data/campusData';

const CAMPUS_LAYOUTS: Record<string, Array<{ x: number; y: number }>> = {
  sjce: [
    { x: 38, y: 38 }, { x: 52, y: 44 }, { x: 62, y: 33 }, { x: 30, y: 55 },
    { x: 68, y: 50 }, { x: 46, y: 60 }, { x: 72, y: 38 }, { x: 26, y: 44 },
  ],
  sjit: [
    { x: 44, y: 36 }, { x: 57, y: 42 }, { x: 65, y: 33 }, { x: 36, y: 53 },
    { x: 70, y: 48 }, { x: 52, y: 58 }, { x: 75, y: 38 }, { x: 28, y: 43 },
  ],
  cit: [
    { x: 40, y: 35 }, { x: 52, y: 30 }, { x: 62, y: 42 }, { x: 35, y: 52 },
    { x: 68, y: 38 }, { x: 47, y: 58 }, { x: 74, y: 46 }, { x: 28, y: 40 },
    { x: 58, y: 55 }, { x: 44, y: 25 }, { x: 70, y: 58 }, { x: 32, y: 30 },
  ],
};

interface CampusBackgroundOverlayProps {
  campus: Campus;
}

const CampusBackgroundOverlay = ({ campus }: CampusBackgroundOverlayProps) => {
  const [visible, setVisible] = useState(false);
  const layout = CAMPUS_LAYOUTS[campus.id] ?? CAMPUS_LAYOUTS.sjce;
  const pins = campus.buildings.slice(0, layout.length).map((b, i) => ({
    ...b, x: layout[i].x, y: layout[i].y, delay: i * 0.1,
  }));

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [campus.id]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Subtle campus glow blob */}
      <div
        style={{
          position: 'absolute', top: '5%', left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw', height: '60vw', maxWidth: 1000, maxHeight: 750,
          borderRadius: '42% 58% 55% 45% / 46% 42% 58% 54%',
          background: `radial-gradient(ellipse at center, ${campus.color}0A 0%, ${campus.color}04 45%, transparent 75%)`,
          filter: 'blur(50px)',
          animation: 'aurora-drift-1 14s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />
      {/* Floating location pins */}
      {pins.map((pin, i) => (
        <div
          key={pin.id}
          style={{
            position: 'absolute',
            left: `${pin.x}%`, top: `${pin.y}%`,
            transform: `translate(-50%, -50%) translateY(${visible ? 0 : 20}px)`,
            opacity: visible ? 0.65 : 0,
            transition: `opacity 0.7s ease ${pin.delay}s, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${pin.delay}s`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'hsl(var(--depth) / 0.60)',
            border: `1px solid ${campus.color}45`,
            boxShadow: `0 0 14px ${campus.color}25`,
            fontSize: 14, position: 'relative',
            animation: `float-pin-${(i % 3) + 1} ${3.2 + (i % 4) * 0.5}s ease-in-out infinite`,
          }}>
            {pin.icon}
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `1px solid ${campus.color}35`,
              animation: 'beacon-ring 2.5s ease-out infinite',
              animationDelay: `${pin.delay * 0.6}s`,
            }} />
          </div>
          <span style={{
            marginTop: 3, fontFamily: 'Orbitron, sans-serif', fontSize: 8,
            letterSpacing: '0.06em', whiteSpace: 'nowrap', padding: '2px 6px',
            borderRadius: 999, background: 'hsl(var(--depth) / 0.65)',
            color: campus.color, border: `1px solid ${campus.color}28`,
          }}>
            {pin.name}
          </span>
          <div style={{ width: 1, height: 8, background: `linear-gradient(to bottom, ${campus.color}40, transparent)` }} />
        </div>
      ))}
    </div>
  );
};

export default CampusBackgroundOverlay;
