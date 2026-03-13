import { TabId } from './Masterbar';

const descriptions: Record<TabId, { title: string; desc: string; icon: string }> = {
  navigate: { title: 'Navigate', desc: 'Select a campus above to explore the interactive map.', icon: '🗺️' },
  helpdesk: { title: 'Help Desk', desc: 'AI-powered campus assistant and emergency contacts. Coming soon.', icon: '🆘' },
  events: { title: 'Events', desc: 'Campus events, cultural fests, and placement drives. Coming soon.', icon: '📅' },
  heatmap: { title: 'Heatmap', desc: 'Real-time crowd density visualization. Coming soon.', icon: '🔥' },
  occupancy: { title: 'Occupancy', desc: 'Live building occupancy tracking. Coming soon.', icon: '🏢' },
  indoor: { title: 'Indoor Navigation', desc: 'SVG floor plans with A* pathfinding. Coming soon.', icon: '🧭' },
  feedback: { title: 'Feedback', desc: 'Student voice, amplified and visualized. Coming soon.', icon: '💬' },
  admin: { title: 'Admin Portal', desc: 'Secured control panel for campus management. Coming soon.', icon: '🔐' },
  arvr: { title: 'AR/VR Suite', desc: 'Immersive augmented and virtual reality campus experiences.', icon: '🥽' },
};

const TabPlaceholder = ({ tabId }: { tabId: TabId }) => {
  const info = descriptions[tabId];
  return (
    <div className="tab-enter flex flex-col items-center justify-center py-32 px-4 text-center">
      <span className="text-6xl mb-6">{info.icon}</span>
      <h2 className="font-ui text-xl font-bold tracking-wider mb-3">{info.title}</h2>
      <p className="font-body text-text-2 max-w-md">{info.desc}</p>
    </div>
  );
};

export default TabPlaceholder;
