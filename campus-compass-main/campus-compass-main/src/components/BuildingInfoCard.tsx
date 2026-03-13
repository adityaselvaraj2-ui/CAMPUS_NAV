import { ExternalLink, X, Clock, Users, Layers } from 'lucide-react';
import { Building, Campus, getBuildingStatus, categoryLabels } from '@/data/campusData';

interface BuildingInfoCardProps {
  building: Building;
  campus: Campus;
  onClose: () => void;
}

const BuildingInfoCard = ({ building, campus, onClose }: BuildingInfoCardProps) => {
  const status = getBuildingStatus(building);

  const handleDirections = () => {
    const dest = `${building.lat},${building.lng}`;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`,
            '_blank'
          );
        },
        () => {
          // Fallback to campus main gate
          const gate = campus.buildings.find((b) => b.name === 'Main Gate');
          const origin = gate ? `${gate.lat},${gate.lng}` : `${campus.center[0]},${campus.center[1]}`;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`,
            '_blank'
          );
        }
      );
    }
  };

  const statusColorClass = status.status === 'open'
    ? 'bg-aurora-3/20 text-aurora-3 border-aurora-3/30'
    : status.status === 'closing'
    ? 'bg-solar/20 text-solar border-solar/30'
    : 'bg-nova/20 text-nova border-nova/30';

  const statusDotClass = status.status === 'open'
    ? 'bg-aurora-3 status-open'
    : status.status === 'closing'
    ? 'bg-solar status-closing'
    : 'bg-nova';

  return (
    <div className="absolute bottom-4 right-4 md:top-20 md:bottom-auto z-[1000] w-[calc(100%-2rem)] md:w-[360px] animate-slide-in-right">
      <div className="glass-card overflow-hidden" style={{ borderColor: `${campus.color}30` }}>
        {/* Status bar */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${statusDotClass}`} />
          <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md border ${statusColorClass}`}>
            {status.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{building.icon}</span>
                <h3
                  className="font-ui text-base font-bold tracking-wider"
                  style={{ color: campus.color }}
                >
                  {building.name}
                </h3>
              </div>
              <span className="font-mono text-xs text-text-3 uppercase tracking-widest">
                {categoryLabels[building.category]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-text-3 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="font-body text-sm text-text-2 mb-4 leading-relaxed">
            {building.description}
          </p>

          {/* Meta */}
          <div className="flex gap-4 mb-5">
            {building.floors !== undefined && building.floors > 0 && (
              <div className="flex items-center gap-1.5 text-text-3">
                <Layers className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">{building.floors} floors</span>
              </div>
            )}
            {building.capacity && (
              <div className="flex items-center gap-1.5 text-text-3">
                <Users className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">{building.capacity} cap.</span>
              </div>
            )}
            {building.schedule?.weekday && (
              <div className="flex items-center gap-1.5 text-text-3">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">
                  {building.schedule.weekday.open}–{building.schedule.weekday.close}
                </span>
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="font-mono text-[10px] text-text-3 mb-5 tracking-wider">
            {building.lat.toFixed(4)}°N, {building.lng.toFixed(4)}°E
          </div>

          {/* Directions CTA */}
          <button
            onClick={handleDirections}
            className="w-full py-3 rounded-xl font-ui text-xs font-bold tracking-wider
                       transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: `linear-gradient(135deg, ${campus.color}, ${campus.color}90)`,
              color: '#020409',
              boxShadow: `0 4px 20px ${campus.color}40`,
            }}
          >
            GET DIRECTIONS
            <ExternalLink className="w-3.5 h-3.5 inline-block ml-2 -mt-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingInfoCard;
