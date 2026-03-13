import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Campus, Building, getBuildingStatus, categoryLabels } from '@/data/campusData';
import BuildingInfoCard from './BuildingInfoCard';
import BuildingDirectory from './BuildingDirectory';

interface CampusMapProps {
  campus: Campus;
  onBack: () => void;
}

const CampusMap = ({ campus, onBack }: CampusMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);

  const flyToBuilding = useCallback((building: Building) => {
    setSelectedBuilding(building);
    mapInstanceRef.current?.flyTo([building.lat, building.lng], 19, {
      duration: 0.8,
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: campus.center,
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add markers
    campus.buildings.forEach((building) => {
      const status = getBuildingStatus(building);
      const statusColor = status.status === 'open' ? '#00FF88' : status.status === 'closing' ? '#FFB830' : '#FF4757';

      const icon = L.divIcon({
        className: 'campus-marker',
        html: `
          <div class="marker-icon" style="background: hsl(var(--depth)); border-color: ${campus.color}; box-shadow: 0 0 12px ${campus.color}40;">
            <span>${building.icon}</span>
          </div>
          <div class="pulse-ring beacon-ring" style="border-color: ${campus.color}40;"></div>
          <div class="pulse-ring beacon-ring beacon-ring-delay-1" style="border-color: ${campus.color}20;"></div>
          <div style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:${statusColor};z-index:10;${status.status === 'open' ? 'animation:status-breathe 2s infinite;' : ''}"></div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([building.lat, building.lng], { icon })
        .addTo(map)
        .on('click', () => flyToBuilding(building));

      marker.bindTooltip(
        `<div style="font-family:Orbitron,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;padding:4px 8px;">${building.name}</div>`,
        {
          direction: 'top',
          offset: [0, -24],
          className: 'custom-tooltip',
        }
      );

      markersRef.current.push(marker);
    });

    // Add tooltip styles
    const style = document.createElement('style');
    style.textContent = `
      .custom-tooltip {
        background: hsl(var(--depth)) !important;
        border: 1px solid ${campus.color}60 !important;
        border-radius: 8px !important;
        box-shadow: 0 0 20px ${campus.color}20 !important;
        color: hsl(var(--text-1)) !important;
        padding: 0 !important;
      }
      .custom-tooltip::before {
        border-top-color: ${campus.color}60 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      style.remove();
    };
  }, [campus, flyToBuilding]);

  return (
    <div className="relative w-full h-[calc(100vh-70px)] tab-enter">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
        <button
          onClick={onBack}
          className="glass-card px-4 py-2 font-ui text-xs tracking-wider text-text-2 hover:text-primary hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          ← BACK
        </button>

        <div className="glass-card px-5 py-2 font-ui text-xs tracking-widest font-bold" style={{ color: campus.color }}>
          {campus.shortName} · NAVIGATE
        </div>

        <button
          onClick={() => setShowDirectory(!showDirectory)}
          className="glass-card px-4 py-2 font-ui text-xs tracking-wider text-text-2 hover:text-primary transition-all"
        >
          {showDirectory ? '✕ CLOSE' : '☰ DIRECTORY'}
        </button>
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Building Directory */}
      {showDirectory && (
        <BuildingDirectory
          campus={campus}
          onSelectBuilding={flyToBuilding}
          onClose={() => setShowDirectory(false)}
        />
      )}

      {/* Building Info Card */}
      {selectedBuilding && (
        <BuildingInfoCard
          building={selectedBuilding}
          campus={campus}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  );
};

export default CampusMap;
