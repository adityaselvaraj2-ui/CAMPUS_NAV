import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Campus, Building, BuildingCategory, getBuildingStatus, categoryLabels, categoryColors } from '@/data/campusData';

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
      academic: [],
      residential: [],
      facility: [],
      recreation: [],
    };
    campus.buildings.forEach((b) => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return;
      result[b.category].push(b);
    });
    return result;
  }, [campus, search]);

  return (
    <div className="absolute top-16 left-4 bottom-4 z-[1000] w-[300px] hidden md:block animate-slide-in-right">
      <div className="glass-card h-full flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
            <input
              type="text"
              placeholder="Search buildings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2 
                         font-body text-sm text-foreground placeholder:text-text-3
                         focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {categories.map((cat) => {
            const buildings = grouped[cat];
            if (buildings.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="font-ui text-[10px] tracking-widest text-text-3 mb-2 uppercase">
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

                    return (
                      <button
                        key={building.id}
                        onClick={() => onSelectBuilding(building)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                   hover:bg-muted/50 transition-all duration-200
                                   hover:-translate-y-0.5 active:translate-y-0 text-left"
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
