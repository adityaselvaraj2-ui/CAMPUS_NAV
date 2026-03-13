import { useState, useRef, useEffect } from 'react';
import { Map, HelpCircle, Calendar, Flame, Building2, Compass, MessageCircle, Lock, Glasses } from 'lucide-react';

export type TabId = 'navigate' | 'helpdesk' | 'events' | 'heatmap' | 'occupancy' | 'indoor' | 'feedback' | 'arvr' | 'admin';

interface MasterbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  accentColor: string;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'navigate', label: 'NAVIGATE', icon: Map },
  { id: 'helpdesk', label: 'HELP', icon: HelpCircle },
  { id: 'events', label: 'EVENTS', icon: Calendar },
  { id: 'heatmap', label: 'HEATMAP', icon: Flame },
  { id: 'occupancy', label: 'OCCUPANCY', icon: Building2 },
  { id: 'indoor', label: 'INDOOR', icon: Compass },
  { id: 'feedback', label: 'FEEDBACK', icon: MessageCircle },
  { id: 'arvr', label: 'AR/VR', icon: Glasses },
  { id: 'admin', label: 'ADMIN', icon: Lock },
];

const Masterbar = ({ activeTab, onTabChange, accentColor }: MasterbarProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[idx];
    const container = containerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div className="sticky top-[80px] z-40 flex justify-center px-4 mb-6">
      <div
        ref={containerRef}
        className="glass-card relative flex items-center gap-0.5 p-1.5 overflow-x-auto max-w-[90vw] scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Active indicator */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-350"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: `${accentColor}15`,
            borderBottom: `2px solid ${accentColor}`,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => onTabChange(tab.id)}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-[10px] tracking-wider
                         transition-all duration-200 whitespace-nowrap
                         hover:-translate-y-0.5 active:translate-y-0
                         ${isActive ? 'text-foreground' : 'text-text-3 hover:text-text-2'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Masterbar;
