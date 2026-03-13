import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Campus } from '@/data/campusData';

interface HeatmapTabProps {
  campus: Campus;
}

function getTimeWeight(hour: number): number {
  if (hour < 6) return 0.02;
  if (hour < 8) return 0.15;
  if (hour < 10) return 0.7;
  if (hour < 12) return 0.85;
  if (hour < 14) return 0.95;
  if (hour < 16) return 0.75;
  if (hour < 18) return 0.5;
  if (hour < 20) return 0.25;
  return 0.05;
}

function intensityToColor(t: number): string {
  if (t < 0.25) return `rgba(0,100,255,${0.3 + t * 2})`;
  if (t < 0.5) return `rgba(0,${Math.round(180 + t * 150)},100,${0.4 + t})`;
  if (t < 0.75) return `rgba(${Math.round(255 * t)},${Math.round(180 - t * 100)},0,${0.5 + t * 0.4})`;
  return `rgba(255,${Math.round(70 - t * 60)},${Math.round(40 - t * 30)},${0.6 + t * 0.3})`;
}

const HeatmapTab = ({ campus }: HeatmapTabProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeSlider, setTimeSlider] = useState(new Date().getHours());
  const [occupancyData, setOccupancyData] = useState<Record<string, number>>({});
  const [topBuildings, setTopBuildings] = useState<{ name: string; count: number; max: number }[]>([]);

  const generateOccupancy = useCallback((hour: number) => {
    const weight = getTimeWeight(hour);
    const data: Record<string, number> = {};
    campus.buildings.forEach(b => {
      const cap = b.capacity || 100;
      const base = cap * weight;
      data[b.id] = Math.round(base * (0.6 + Math.random() * 0.5));
    });
    return data;
  }, [campus]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: campus.center,
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [campus]);

  // Generate data and draw heatmap
  useEffect(() => {
    const data = generateOccupancy(timeSlider);
    setOccupancyData(data);

    // Top 5
    const sorted = campus.buildings
      .map(b => ({ name: b.name, count: data[b.id] || 0, max: b.capacity || 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopBuildings(sorted);
  }, [timeSlider, campus, generateOccupancy]);

  // Draw canvas overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    const canvas = canvasRef.current;
    if (!map || !canvas) return;

    const draw = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      campus.buildings.forEach(b => {
        const count = occupancyData[b.id] || 0;
        if (count === 0) return;
        const point = map.latLngToContainerPoint([b.lat, b.lng]);
        const cap = b.capacity || 100;
        const intensity = Math.min(count / cap, 1);
        const radius = 30 + intensity * 50;
        const grd = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        const color = intensityToColor(intensity);
        grd.addColorStop(0, color);
        grd.addColorStop(0.6, color.replace(/[\d.]+\)$/, `${intensity * 0.3})`));
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    draw();
    map.on('moveend zoomend', draw);
    const interval = setInterval(() => {
      // Slight fluctuation
      setOccupancyData(prev => {
        const next = { ...prev };
        for (const key in next) {
          next[key] = Math.max(0, next[key] + Math.round((Math.random() - 0.5) * 10));
        }
        return next;
      });
    }, 3000);

    return () => {
      map.off('moveend zoomend', draw);
      clearInterval(interval);
    };
  }, [occupancyData, campus]);

  const maxCount = Math.max(...topBuildings.map(b => b.count), 1);

  return (
    <div className="tab-enter relative w-full" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Map */}
      <div ref={mapRef} className="w-full h-full" />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none z-[400]"
      />

      {/* Time scrubber */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-16 sm:right-16 z-[500]">
        <div className="glass-card px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-ui text-[10px] tracking-widest text-text-3">TIME SCRUBBER</span>
            <span className="font-mono text-sm text-primary">{String(timeSlider).padStart(2, '0')}:00</span>
          </div>
          <input
            type="range"
            min={6}
            max={22}
            value={timeSlider}
            onChange={(e) => setTimeSlider(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-depth cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(var(--aurora-1)/0.5)]"
          />
          <div className="flex justify-between font-mono text-[9px] text-text-3 mt-1">
            <span>6AM</span><span>10AM</span><span>2PM</span><span>6PM</span><span>10PM</span>
          </div>
        </div>
      </div>

      {/* Top 5 panel */}
      <div className="absolute top-4 right-4 z-[500] w-64 hidden sm:block">
        <div className="glass-card p-4">
          <div className="font-ui text-[10px] tracking-widest text-text-3 mb-3">TOP 5 HOTSPOTS</div>
          <div className="space-y-3">
            {topBuildings.map((b, i) => {
              const pct = Math.round((b.count / maxCount) * 100);
              const intensity = b.count / b.max;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-2 truncate mr-2">{b.name}</span>
                    <span className="font-mono text-text-3">{b.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-depth overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: intensity > 0.7 ? 'hsl(var(--nova))' : intensity > 0.4 ? 'hsl(var(--solar))' : 'hsl(var(--aurora-3))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[500] hidden sm:block">
        <div className="glass-card p-3 flex items-center gap-2">
          <div className="w-24 h-3 rounded-full" style={{
            background: 'linear-gradient(90deg, rgba(0,100,255,0.7), rgba(0,230,100,0.7), rgba(255,180,0,0.7), rgba(255,70,40,0.8))'
          }} />
          <div className="flex justify-between w-24 font-mono text-[8px] text-text-3">
            <span>LOW</span><span>HIGH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTab;
