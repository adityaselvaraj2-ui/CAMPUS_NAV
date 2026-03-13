import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [bouncingTab, setBouncingTab] = useState<TabId | null>(null);
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
    // Trigger icon bounce
    setBouncingTab(activeTab);
    const t = setTimeout(() => setBouncingTab(null), 400);
    return () => clearTimeout(t);
  }, [activeTab]);

  const handleTabClick = useCallback((tab: TabId, e: React.MouseEvent<HTMLButtonElement>) => {
    // Spawn ripple
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      left:${e.clientX - rect.left}px; top:${e.clientY - rect.top}px;
      background:${accentColor}; opacity:0.3;
      animation: tab-ripple 500ms cubic-bezier(0.16,1,0.3,1) forwards;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    onTabChange(tab);
  }, [onTabChange, accentColor]);

  return (
    <div
      className="sticky top-[80px] z-40 flex justify-center px-4 mb-6"
      style={{ animation: 'masterbar-enter 700ms cubic-bezier(0.16,1,0.3,1) 300ms both' }}
    >
      <div
        ref={containerRef}
        className="glass-card relative flex items-center gap-0.5 p-1.5 overflow-x-auto max-w-[90vw] scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Active indicator with glow */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-350"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}08)`,
            borderBottom: `2px solid ${accentColor}`,
            boxShadow: `0 0 12px ${accentColor}40, 0 0 4px ${accentColor}80, 0 2px 16px ${accentColor}25`,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isBouncing = bouncingTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={(e) => handleTabClick(tab.id, e)}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-[10px] tracking-wider
                         transition-all duration-200 whitespace-nowrap overflow-hidden
                         hover:-translate-y-0.5 active:translate-y-0
                         ${isActive ? 'text-foreground' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={isBouncing ? {
                  animation: 'icon-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                } : undefined}
              />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Masterbar;