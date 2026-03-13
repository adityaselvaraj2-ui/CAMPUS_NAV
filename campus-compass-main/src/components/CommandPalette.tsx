import { useState, useEffect, useRef } from 'react';
import { campuses } from '@/data/campusData';
import { Search, MapPin, Calendar } from 'lucide-react';

export const CommandPalette = ({ onSelectBuilding }: { onSelectBuilding?: (campusId: string, buildingName: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const results = query.length > 1 ? campuses.flatMap(c =>
    c.buildings
      .filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || b.description.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(b => ({ campus: c, building: b }))
  ).slice(0, 8) : [];

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-border text-muted-foreground/40 font-ui text-xs hover:text-muted-foreground hover:border-primary/30 transition-all"
    >
      <Search className="w-3 h-3" />
      <span>Search campus...</span>
      <kbd className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-muted/50 border border-border">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="glass-card w-full max-w-lg mx-4 overflow-hidden animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search buildings, facilities, labs..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-muted/50 border border-border text-muted-foreground/40">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.length > 1 && (
            <div className="p-6 text-center font-ui text-xs text-muted-foreground/30">No buildings found</div>
          )}
          {results.map(({ campus, building }, i) => (
            <button
              key={i}
              className="w-full flex items-start gap-3 p-3 hover:bg-primary/5 transition-colors text-left border-b border-border/50 last:border-0"
              onClick={() => { onSelectBuilding?.(campus.id, building.name); setOpen(false); }}
            >
              <span className="text-lg mt-0.5">{building.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-ui text-xs font-bold text-foreground truncate">{building.name}</div>
                <div className="font-body text-xs text-muted-foreground/50 truncate mt-0.5">{building.description}</div>
              </div>
              <div className="font-ui text-[9px] text-muted-foreground/30 shrink-0 mt-1" style={{ color: campus.color }}>{campus.shortName}</div>
            </button>
          ))}
          {query.length === 0 && (
            <div className="p-4">
              <div className="font-ui text-[9px] tracking-widest text-muted-foreground/30 mb-2">QUICK SHORTCUTS</div>
              {[
                { icon: <MapPin className="w-3 h-3" />, label: 'SJCE Library', sub: 'Block A, Ground floor' },
                { icon: <MapPin className="w-3 h-3" />, label: 'Placement Cell', sub: 'Admin Block, Floor 2' },
                { icon: <Calendar className="w-3 h-3" />, label: 'View all events', sub: 'Switch to Events tab' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
                  <span className="text-muted-foreground/40">{item.icon}</span>
                  <div>
                    <div className="font-ui text-xs text-foreground/70">{item.label}</div>
                    <div className="font-ui text-[9px] text-muted-foreground/30">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
