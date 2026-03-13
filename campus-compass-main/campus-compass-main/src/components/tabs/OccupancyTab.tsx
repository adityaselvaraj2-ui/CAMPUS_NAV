import { useState, useEffect, useCallback } from 'react';
import { Campus, getBuildingStatus } from '@/data/campusData';
import { Users, TrendingUp, ChevronDown } from 'lucide-react';

interface OccupancyTabProps {
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

function getCrowdLabel(ratio: number): { label: string; color: string } {
  if (ratio < 0.3) return { label: 'QUIET', color: 'hsl(var(--aurora-3))' };
  if (ratio < 0.6) return { label: 'MODERATE', color: 'hsl(var(--solar))' };
  if (ratio < 0.85) return { label: 'BUSY', color: 'hsl(var(--nova))' };
  return { label: 'PACKED', color: 'hsl(var(--nova))' };
}

const OccupancyTab = ({ campus }: OccupancyTabProps) => {
  const [occupancy, setOccupancy] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const generate = useCallback(() => {
    const hour = new Date().getHours();
    const weight = getTimeWeight(hour);
    const data: Record<string, number> = {};
    campus.buildings.forEach(b => {
      const cap = b.capacity || 100;
      data[b.id] = Math.round(cap * weight * (0.5 + Math.random() * 0.6));
    });
    return data;
  }, [campus]);

  useEffect(() => {
    setOccupancy(generate());
    const id = setInterval(() => setOccupancy(generate()), 60000);
    return () => clearInterval(id);
  }, [generate]);

  // Sparkline data (24 hours)
  const getSparkline = useCallback((cap: number) => {
    const points: number[] = [];
    for (let h = 0; h < 24; h++) {
      points.push(Math.round(cap * getTimeWeight(h) * (0.6 + Math.random() * 0.4)));
    }
    return points;
  }, []);

  return (
    <div className="tab-enter max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Live Occupancy</h2>
          <p className="text-text-3 text-xs mt-1">{campus.shortName} · Updated every 60s</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-aurora-3 status-open" />
          <span className="font-mono text-xs text-text-3">LIVE</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campus.buildings.map((building, i) => {
          const count = occupancy[building.id] || 0;
          const cap = building.capacity || 100;
          const ratio = Math.min(count / cap, 1);
          const crowd = getCrowdLabel(ratio);
          const status = getBuildingStatus(building);
          const sparkline = getSparkline(cap);
          const maxSpark = Math.max(...sparkline, 1);
          const isExpanded = expanded === building.id;

          return (
            <div
              key={building.id}
              className="glass-card overflow-hidden animate-fade-up cursor-pointer"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => setExpanded(isExpanded ? null : building.id)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{building.icon}</span>
                    <div>
                      <h3 className="font-ui text-[10px] tracking-wider text-foreground">{building.name.toUpperCase()}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className={`w-2 h-2 rounded-full ${status.status === 'open' ? 'status-open' : status.status === 'closing' ? 'status-closing' : ''}`}
                          style={{
                            background: status.status === 'open' ? 'hsl(var(--aurora-3))' :
                                        status.status === 'closing' ? 'hsl(var(--solar))' : 'hsl(var(--nova))'
                          }}
                        />
                        <span className="text-[9px] text-text-3">{status.label}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-text-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Occupancy bar */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-depth overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${ratio * 100}%`,
                        background: ratio > 0.85 ? 'hsl(var(--nova))' :
                                    ratio > 0.6 ? 'hsl(var(--solar))' :
                                    ratio > 0.3 ? 'hsl(var(--aurora-1))' : 'hsl(var(--aurora-3))'
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-text-3" />
                    <span className="font-mono text-xs text-text-2">{count} / {cap}</span>
                  </div>
                  <span className="font-ui text-[9px] tracking-wider" style={{ color: crowd.color }}>
                    {crowd.label}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-text-3" />
                  <svg viewBox="0 0 96 20" className="flex-1 h-5">
                    <polyline
                      fill="none"
                      stroke="hsl(var(--aurora-1))"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.6"
                      points={sparkline.map((v, i) => `${i * 4},${20 - (v / maxSpark) * 18}`).join(' ')}
                    />
                  </svg>
                  <span className="font-mono text-[8px] text-text-3">24h</span>
                </div>
              </div>

              {/* Expanded floor breakdown */}
              <div
                className="overflow-hidden transition-all duration-500"
                style={{
                  maxHeight: isExpanded ? '300px' : '0',
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <div className="font-ui text-[9px] tracking-widest text-text-3 mb-2">FLOOR BREAKDOWN</div>
                  {Array.from({ length: building.floors || 1 }, (_, f) => {
                    const floorCount = Math.round(count / (building.floors || 1) * (0.5 + Math.random()));
                    const floorCap = Math.round(cap / (building.floors || 1));
                    const floorRatio = Math.min(floorCount / floorCap, 1);
                    return (
                      <div key={f} className="flex items-center gap-3 mb-1.5">
                        <span className="font-mono text-[9px] text-text-3 w-8">F{f}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-depth overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${floorRatio * 100}%`,
                              background: floorRatio > 0.7 ? 'hsl(var(--solar))' : 'hsl(var(--aurora-1))',
                              transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
                            }}
                          />
                        </div>
                        <span className="font-mono text-[9px] text-text-3 w-12 text-right">{floorCount}/{floorCap}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OccupancyTab;
