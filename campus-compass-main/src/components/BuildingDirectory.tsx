import { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Campus, Building, BuildingCategory, getBuildingStatus, categoryLabels } from '@/data/campusData';

interface BuildingDirectoryProps {
  campus: Campus;
  onSelectBuilding: (building: Building) => void;
  onClose: () => void;
}

const categories: BuildingCategory[] = ['academic', 'residential', 'facility', 'recreation'];

const BuildingDirectory = ({ campus, onSelectBuilding }: BuildingDirectoryProps) => {
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const result: Record<BuildingCategory, Building[]> = {
      academic: [], residential: [], facility: [], recreation: [],
    };
    campus.buildings.forEach((b) => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return;
      result[b.category].push(b);
    });
    return result;
  }, [campus, search]);

  const handleTilt = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    e.currentTarget.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg)`;

    // Shimmer highlight
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.06), transparent 60%)`;
  }, []);

  const handleTiltLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.background = '';
  }, []);

  let globalIndex = 0;

  return (
    <div className="absolute top-16 left-4 bottom-4 z-[1000] w-[300px] hidden md:block"
         style={{ animation: 'slide-in-right-enhanced 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
      <div className="glass-card h-full flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 transition-colors peer-focus:text-primary" />
            <input
              type="text"
              placeholder="Search buildings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="peer w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2
                         font-body text-sm text-foreground placeholder:text-muted-foreground/30
                         focus:outline-none focus:border-primary/50
                         focus:shadow-[0_0_0_2px_hsl(var(--aurora-1)/0.3),0_0_16px_hsl(var(--aurora-1)/0.15)]
                         transition-all duration-300"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4" key={search}>
          {categories.map((cat) => {
            const buildings = grouped[cat];
            if (buildings.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="relative font-ui text-[10px] tracking-widest text-muted-foreground/30 mb-2 uppercase
                              after:content-[''] after:absolute after:left-0 after:bottom-[-2px]
                              after:h-[1px] after:bg-primary after:opacity-0
                              after:animate-[category-scan_600ms_ease-out_forwards]">
                  {categoryLabels[cat]}
                </h4>
                <div className="space-y-1">
                  {buildings.map((building) => {
                    const status = getBuildingStatus(building);
                    const statusDot = status.status === 'open'
                      ? 'bg-aurora-3'
                      : status.status === 'closing'
                      ? 'bg-solar'
                      : 'bg-nova';
                    const idx = globalIndex++;

                    return (
                      <button
                        key={building.id}
                        onClick={() => onSelectBuilding(building)}
                        onMouseMove={handleTilt}
                        onMouseLeave={handleTiltLeave}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                   hover:bg-muted/50 transition-colors duration-200 text-left"
                        style={{
                          animation: `list-item-enter 350ms cubic-bezier(0.16,1,0.3,1) ${idx * 40}ms both`,
                          transitionProperty: 'background-color',
                        }}
                      >
                        <span className="text-lg">{building.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-body text-sm text-foreground block truncate">
                            {building.name}
                          </span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${statusDot} flex-shrink-0`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BuildingDirectory;