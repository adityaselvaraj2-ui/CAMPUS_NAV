import { useState, useCallback, useMemo } from 'react';
import { Campus } from '@/data/campusData';
import { Navigation, ArrowRight } from 'lucide-react';

interface Room {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'classroom' | 'lab' | 'faculty' | 'restroom' | 'stairs' | 'corridor' | 'entrance';
}

interface FloorData {
  level: string;
  rooms: Room[];
  graph: Record<string, string[]>;
}

interface BuildingFloorPlan {
  name: string;
  icon: string;
  floors: FloorData[];
}

const FLOOR_PLANS: Record<string, BuildingFloorPlan> = {
  library: {
    name: 'Central Library',
    icon: '📚',
    floors: [
      {
        level: 'Ground Floor',
        rooms: [
          { id: 'entrance', label: 'Entrance', x: 220, y: 340, w: 60, h: 40, type: 'entrance' },
          { id: 'issue', label: 'Issue Counter', x: 180, y: 260, w: 140, h: 50, type: 'faculty' },
          { id: 'reading1', label: 'Reading Hall A', x: 20, y: 20, w: 200, h: 220, type: 'classroom' },
          { id: 'reading2', label: 'Reading Hall B', x: 280, y: 20, w: 200, h: 220, type: 'classroom' },
          { id: 'digital', label: 'Digital Library', x: 20, y: 260, w: 140, h: 80, type: 'lab' },
          { id: 'stairs1', label: 'Stairs', x: 230, y: 20, w: 40, h: 40, type: 'stairs' },
          { id: 'toilet1', label: 'Restroom', x: 440, y: 260, w: 60, h: 60, type: 'restroom' },
        ],
        graph: {
          entrance: ['issue', 'digital'],
          issue: ['entrance', 'reading1', 'reading2'],
          reading1: ['issue', 'stairs1'],
          reading2: ['issue', 'stairs1'],
          digital: ['entrance', 'stairs1'],
          stairs1: ['reading1', 'reading2', 'digital'],
          toilet1: ['reading2'],
        },
      },
      {
        level: 'First Floor',
        rooms: [
          { id: 'ref1', label: 'Reference Section', x: 20, y: 20, w: 200, h: 180, type: 'classroom' },
          { id: 'ref2', label: 'Periodicals', x: 280, y: 20, w: 200, h: 180, type: 'classroom' },
          { id: 'study1', label: 'Study Room 1', x: 20, y: 220, w: 140, h: 100, type: 'classroom' },
          { id: 'study2', label: 'Study Room 2', x: 340, y: 220, w: 140, h: 100, type: 'classroom' },
          { id: 'stairs2', label: 'Stairs', x: 230, y: 20, w: 40, h: 40, type: 'stairs' },
          { id: 'toilet2', label: 'Restroom', x: 180, y: 220, w: 60, h: 60, type: 'restroom' },
        ],
        graph: {
          ref1: ['stairs2', 'study1'],
          ref2: ['stairs2', 'study2'],
          study1: ['ref1', 'toilet2'],
          study2: ['ref2'],
          stairs2: ['ref1', 'ref2'],
          toilet2: ['study1'],
        },
      },
    ],
  },
  cse: {
    name: 'CSE Block',
    icon: '💻',
    floors: [
      {
        level: 'Ground Floor',
        rooms: [
          { id: 'lobby', label: 'Lobby', x: 200, y: 300, w: 100, h: 60, type: 'entrance' },
          { id: 'lab1', label: 'Lab 001', x: 20, y: 20, w: 160, h: 120, type: 'lab' },
          { id: 'lab2', label: 'Lab 002', x: 320, y: 20, w: 160, h: 120, type: 'lab' },
          { id: 'class1', label: 'Room 003', x: 20, y: 160, w: 160, h: 120, type: 'classroom' },
          { id: 'class2', label: 'Room 004', x: 320, y: 160, w: 160, h: 120, type: 'classroom' },
          { id: 'stairs', label: 'Stairs', x: 220, y: 20, w: 60, h: 40, type: 'stairs' },
          { id: 'toilet', label: 'Restroom', x: 220, y: 160, w: 60, h: 50, type: 'restroom' },
        ],
        graph: {
          lobby: ['class1', 'class2', 'stairs'],
          lab1: ['stairs', 'class1'],
          lab2: ['stairs', 'class2'],
          class1: ['lobby', 'lab1'],
          class2: ['lobby', 'lab2'],
          stairs: ['lobby', 'lab1', 'lab2'],
          toilet: ['class1', 'class2'],
        },
      },
    ],
  },
  admin: {
    name: 'Admin Block',
    icon: '🏛️',
    floors: [
      {
        level: 'Ground Floor',
        rooms: [
          { id: 'reception', label: 'Reception', x: 180, y: 280, w: 140, h: 60, type: 'entrance' },
          { id: 'principal', label: "Principal's Office", x: 20, y: 20, w: 180, h: 120, type: 'faculty' },
          { id: 'accounts', label: 'Accounts', x: 300, y: 20, w: 180, h: 120, type: 'faculty' },
          { id: 'registrar', label: 'Registrar', x: 20, y: 160, w: 140, h: 100, type: 'faculty' },
          { id: 'exam', label: 'Exam Cell', x: 340, y: 160, w: 140, h: 100, type: 'faculty' },
          { id: 'stairs', label: 'Stairs', x: 220, y: 20, w: 60, h: 40, type: 'stairs' },
        ],
        graph: {
          reception: ['registrar', 'exam', 'stairs'],
          principal: ['stairs', 'accounts'],
          accounts: ['principal', 'stairs'],
          registrar: ['reception', 'principal'],
          exam: ['reception', 'accounts'],
          stairs: ['reception', 'principal', 'accounts'],
        },
      },
    ],
  },
};

const roomColors: Record<string, string> = {
  classroom: 'hsl(var(--aurora-1))',
  lab: 'hsl(193 100% 50% / 0.7)',
  faculty: 'hsl(var(--solar))',
  restroom: 'hsl(var(--text-3))',
  stairs: 'hsl(var(--foreground))',
  corridor: 'hsl(var(--text-3))',
  entrance: 'hsl(var(--aurora-3))',
};

// A* pathfinding
function findPath(graph: Record<string, string[]>, start: string, end: string): string[] | null {
  if (start === end) return [start];
  const visited = new Set<string>();
  const queue: string[][] = [[start]];
  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    if (node === end) return path;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of (graph[node] || [])) {
      if (!visited.has(neighbor)) {
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

interface IndoorNavTabProps {
  campus: Campus;
}

const IndoorNavTab = ({ campus: _campus }: IndoorNavTabProps) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('library');
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [fromRoom, setFromRoom] = useState<string>('');
  const [toRoom, setToRoom] = useState<string>('');
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const plan = FLOOR_PLANS[selectedBuilding];
  const floor = plan?.floors[selectedFloor];

  const path = useMemo(() => {
    if (!fromRoom || !toRoom || !floor) return null;
    return findPath(floor.graph, fromRoom, toRoom);
  }, [fromRoom, toRoom, floor]);

  const getRoomCenter = useCallback((roomId: string) => {
    const room = floor?.rooms.find(r => r.id === roomId);
    if (!room) return null;
    return { x: room.x + room.w / 2, y: room.y + room.h / 2 };
  }, [floor]);

  const pathLine = useMemo(() => {
    if (!path) return '';
    return path.map(id => {
      const c = getRoomCenter(id);
      return c ? `${c.x},${c.y}` : '';
    }).filter(Boolean).join(' ');
  }, [path, getRoomCenter]);

  return (
    <div className="tab-enter max-w-6xl mx-auto px-4 py-6">
      {/* Building selector */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {Object.entries(FLOOR_PLANS).map(([key, bp]) => (
          <button
            key={key}
            onClick={() => { setSelectedBuilding(key); setSelectedFloor(0); setFromRoom(''); setToRoom(''); }}
            className={`glass-card px-4 py-3 flex items-center gap-2 whitespace-nowrap transition-all hover:-translate-y-0.5 active:translate-y-0 ${
              selectedBuilding === key ? 'border-primary/40 bg-primary/10' : ''
            }`}
          >
            <span className="text-lg">{bp.icon}</span>
            <span className="font-ui text-[10px] tracking-wider">{bp.name.toUpperCase()}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Floor plan viewer */}
        <div className="flex-1">
          {/* Floor tabs */}
          {plan && plan.floors.length > 1 && (
            <div className="flex gap-2 mb-4">
              {plan.floors.map((f, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedFloor(i); setFromRoom(''); setToRoom(''); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-ui tracking-wider transition-all ${
                    selectedFloor === i ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-3 border border-border'
                  }`}
                >
                  {f.level.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <div className="glass-card p-4 overflow-auto">
            {floor && (
              <svg viewBox="0 0 500 400" className="w-full h-auto" style={{ maxHeight: '60vh' }}>
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--text-3))" strokeWidth="0.3" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="500" height="400" fill="url(#grid)" />

                {/* Rooms */}
                {floor.rooms.map(room => {
                  const isInPath = path?.includes(room.id);
                  const isHovered = hoveredRoom === room.id;
                  const isSelected = fromRoom === room.id || toRoom === room.id;
                  return (
                    <g key={room.id}>
                      <rect
                        x={room.x}
                        y={room.y}
                        width={room.w}
                        height={room.h}
                        rx={4}
                        fill={isInPath ? 'hsl(var(--aurora-1) / 0.2)' : 'hsl(var(--depth))'}
                        stroke={isSelected ? 'hsl(var(--aurora-1))' : isHovered ? roomColors[room.type] : 'hsl(var(--text-3) / 0.3)'}
                        strokeWidth={isSelected || isHovered ? 2 : 1}
                        className="cursor-pointer transition-all"
                        style={{ strokeDasharray: isHovered ? `${2 * (room.w + room.h)}` : 'none' }}
                        onMouseEnter={() => setHoveredRoom(room.id)}
                        onMouseLeave={() => setHoveredRoom(null)}
                        onClick={() => {
                          if (!fromRoom) setFromRoom(room.id);
                          else if (!toRoom && room.id !== fromRoom) setToRoom(room.id);
                          else { setFromRoom(room.id); setToRoom(''); }
                        }}
                      />
                      <text
                        x={room.x + room.w / 2}
                        y={room.y + room.h / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="pointer-events-none"
                        fill="hsl(var(--text-2))"
                        fontSize={room.w < 80 ? 7 : 9}
                        fontFamily="Orbitron, sans-serif"
                      >
                        {room.label}
                      </text>
                      {/* Type indicator dot */}
                      <circle
                        cx={room.x + 8}
                        cy={room.y + 8}
                        r={3}
                        fill={roomColors[room.type]}
                        opacity={0.7}
                        className="pointer-events-none"
                      />
                    </g>
                  );
                })}

                {/* Path */}
                {pathLine && (
                  <polyline
                    points={pathLine}
                    fill="none"
                    stroke="hsl(var(--aurora-1))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8,4"
                    opacity="0.8"
                    filter="drop-shadow(0 0 6px hsl(var(--aurora-1) / 0.5))"
                  >
                    <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
                  </polyline>
                )}
              </svg>
            )}
          </div>
        </div>

        {/* Controls panel */}
        <div className="lg:w-72">
          <div className="glass-card p-4 space-y-4">
            <div className="font-ui text-[10px] tracking-widest text-text-3 flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              PATHFINDER
            </div>

            <div>
              <label className="font-ui text-[9px] tracking-widest text-text-3 mb-1 block">FROM</label>
              <select
                value={fromRoom}
                onChange={e => setFromRoom(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-depth border border-border text-foreground text-xs font-body focus:outline-none focus:border-primary/50"
              >
                <option value="">Click room or select</option>
                {floor?.rooms.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-text-3 rotate-90" />
            </div>

            <div>
              <label className="font-ui text-[9px] tracking-widest text-text-3 mb-1 block">TO</label>
              <select
                value={toRoom}
                onChange={e => setToRoom(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-depth border border-border text-foreground text-xs font-body focus:outline-none focus:border-primary/50"
              >
                <option value="">Click room or select</option>
                {floor?.rooms.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>

            {path && (
              <div className="border-t border-border pt-3">
                <div className="font-ui text-[9px] tracking-widest text-text-3 mb-2">ROUTE ({path.length - 1} steps)</div>
                <div className="space-y-1.5">
                  {path.map((id, i) => {
                    const room = floor?.rooms.find(r => r.id === id);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-text-2">
                        <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center font-mono text-[8px] text-primary">{i + 1}</span>
                        <span>{room?.label || id}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {fromRoom && toRoom && !path && (
              <div className="text-xs text-nova text-center py-2">No path found between these rooms.</div>
            )}

            <button
              onClick={() => { setFromRoom(''); setToRoom(''); }}
              className="w-full py-2 rounded-lg border border-border text-text-3 font-ui text-[10px] tracking-wider hover:bg-lift transition-all"
            >
              CLEAR
            </button>

            {/* Legend */}
            <div className="border-t border-border pt-3">
              <div className="font-ui text-[9px] tracking-widest text-text-3 mb-2">LEGEND</div>
              <div className="space-y-1">
                {(['classroom', 'lab', 'faculty', 'entrance', 'stairs', 'restroom'] as const).map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: roomColors[type] }} />
                    <span className="text-[10px] text-text-2 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndoorNavTab;
