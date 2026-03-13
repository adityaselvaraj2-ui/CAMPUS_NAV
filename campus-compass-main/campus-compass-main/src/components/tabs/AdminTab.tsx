import { useState, useEffect, useRef } from 'react';
import { Lock, Building2, LayoutGrid, FileText, BarChart3, Plus, Trash2, Edit } from 'lucide-react';

const CORRECT_USER = 'admin';
const CORRECT_PASS = 'campus2025';

interface AdminEvent {
  title: string;
  date: string;
  category: string;
}

const AdminTab = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<'buildings' | 'floorplans' | 'content' | 'analytics'>('analytics');
  const [events, setEvents] = useState<AdminEvent[]>([
    { title: 'JOSE 2025 — National Symposium', date: '2025-03-15', category: 'Technical' },
    { title: 'Freshers Day Celebration', date: '2025-02-20', category: 'Cultural' },
    { title: 'Placement Drive — TCS', date: '2025-03-05', category: 'Placement' },
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCat, setNewEventCat] = useState('Technical');

  const loginRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    setAuthLoading(true);
    setAuthError(false);
    setTimeout(() => {
      if (username === CORRECT_USER && password === CORRECT_PASS) {
        setAuthenticated(true);
      } else {
        setAuthError(true);
        loginRef.current?.classList.add('shake');
        setTimeout(() => loginRef.current?.classList.remove('shake'), 500);
      }
      setAuthLoading(false);
    }, 1500);
  };

  // Animated counters
  const [counters, setCounters] = useState({ navs: 0, visits: 0, feedback: 0, users: 0 });
  useEffect(() => {
    if (!authenticated) return;
    const targets = { navs: 847, visits: 203, feedback: 97.3, users: 142 };
    let frame = 0;
    const animate = () => {
      frame++;
      const t = Math.min(frame / 60, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setCounters({
        navs: Math.round(targets.navs * ease),
        visits: Math.round(targets.visits * ease),
        feedback: Math.round(targets.feedback * ease * 10) / 10,
        users: Math.round(targets.users * ease),
      });
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="tab-enter relative flex items-center justify-center py-24 px-4" style={{ minHeight: '60vh' }}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-full" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,210,255,0.05) 2px, rgba(0,210,255,0.05) 4px)',
            animation: 'scanline 3s linear infinite',
          }} />
        </div>

        <div ref={loginRef} className="glass-card p-8 w-full max-w-sm relative" style={{ transition: 'transform 0.1s' }}>
          <div className="text-center mb-6">
            <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-ui text-sm tracking-widest text-foreground">ADMIN ACCESS REQUIRED</h2>
            <div className="w-8 h-0.5 bg-primary/30 mx-auto mt-3" />
          </div>

          <div className="space-y-4">
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setAuthError(false); }}
              placeholder="USERNAME"
              className={`w-full h-11 px-4 rounded-lg bg-void border font-mono text-sm text-aurora-3 placeholder:text-text-3 focus:outline-none transition-all ${
                authError ? 'border-nova' : 'border-border focus:border-primary/50'
              }`}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(false); }}
              placeholder="PASSWORD"
              className={`w-full h-11 px-4 rounded-lg bg-void border font-mono text-sm text-aurora-3 placeholder:text-text-3 focus:outline-none transition-all ${
                authError ? 'border-nova' : 'border-border focus:border-primary/50'
              }`}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {authError && (
            <div className="mt-3 font-mono text-xs text-nova text-center animate-fade-up">
              ACCESS DENIED · Invalid credentials
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="w-full mt-6 py-3 rounded-lg bg-primary/20 text-primary border border-primary/30 font-ui text-xs tracking-widest hover:bg-primary/30 transition-all disabled:opacity-50"
          >
            {authLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                AUTHENTICATING...
              </div>
            ) : 'LOGIN'}
          </button>

          <p className="mt-4 text-center text-[10px] text-text-3 font-mono">
            Demo: admin / campus2025
          </p>
        </div>
      </div>
    );
  }

  const panels: Record<string, { icon: React.ReactNode; label: string }> = {
    analytics: { icon: <BarChart3 className="w-4 h-4" />, label: 'ANALYTICS' },
    buildings: { icon: <Building2 className="w-4 h-4" />, label: 'BUILDINGS' },
    floorplans: { icon: <LayoutGrid className="w-4 h-4" />, label: 'FLOOR PLANS' },
    content: { icon: <FileText className="w-4 h-4" />, label: 'CONTENT' },
  };

  return (
    <div className="tab-enter max-w-6xl mx-auto px-4 py-6">
      {/* Panel tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Object.entries(panels).map(([key, { icon, label }]) => (
          <button
            key={key}
            onClick={() => setActivePanel(key as typeof activePanel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[10px] tracking-wider transition-all hover:-translate-y-0.5 ${
              activePanel === key ? 'bg-primary/20 text-primary border border-primary/30' : 'glass-card text-text-3'
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        <button
          onClick={() => { setAuthenticated(false); setUsername(''); setPassword(''); }}
          className="ml-auto px-4 py-2.5 rounded-lg text-text-3 border border-border font-ui text-[10px] tracking-wider hover:text-nova hover:border-nova/30 transition-all"
        >
          LOGOUT
        </button>
      </div>

      {/* Analytics Panel */}
      {activePanel === 'analytics' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'NAVIGATIONS TODAY', value: counters.navs, suffix: '', color: 'hsl(var(--aurora-1))' },
            { label: 'MOST VISITED', value: counters.visits, suffix: ' visits', color: 'hsl(var(--aurora-3))' },
            { label: 'SATISFACTION', value: counters.feedback, suffix: '%', color: 'hsl(var(--solar))' },
            { label: 'ACTIVE USERS', value: counters.users, suffix: '', color: 'hsl(var(--aurora-2))' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 text-center" style={{ borderTop: `3px solid ${stat.color}` }}>
              <div className="font-mono text-3xl font-bold text-foreground mb-1">{stat.value}{stat.suffix}</div>
              <div className="font-ui text-[9px] tracking-widest text-text-3">{stat.label}</div>
              {/* Sparkline */}
              <svg viewBox="0 0 80 20" className="w-full h-4 mt-3 opacity-40">
                <polyline
                  fill="none"
                  stroke={stat.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  points={Array.from({ length: 7 }, (_, i) => `${i * 13},${10 + Math.sin(i * 1.2 + stat.value * 0.01) * 8}`).join(' ')}
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Buildings Panel */}
      {activePanel === 'buildings' && (
        <div className="glass-card p-6">
          <div className="text-center py-12 text-text-3">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-ui text-xs tracking-wider mb-2">MAP EDIT MODE</p>
            <p className="text-xs text-text-3">Click on the Navigate map to add new building markers. Drag existing markers to reposition them.</p>
            <p className="text-xs text-text-3 mt-2">Switch to the Navigate tab to enter edit mode.</p>
          </div>
        </div>
      )}

      {/* Floor Plans Panel */}
      {activePanel === 'floorplans' && (
        <div className="glass-card p-6">
          <div className="text-center py-12 text-text-3">
            <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-ui text-xs tracking-wider mb-2">FLOOR PLAN BUILDER</p>
            <p className="text-xs text-text-3">Draw rooms on the SVG grid. Assign types, names, and capacities.</p>
            <p className="text-xs text-text-3 mt-1">Export as SVG. Undo/redo with Ctrl+Z.</p>
            <p className="text-xs text-text-3 mt-4 italic">Use the Indoor Nav tab to view existing floor plans.</p>
          </div>
        </div>
      )}

      {/* Content Manager */}
      {activePanel === 'content' && (
        <div className="glass-card p-6">
          <div className="font-ui text-[10px] tracking-widest text-text-3 mb-4">EVENT MANAGER</div>

          {/* Add event form */}
          <div className="flex flex-wrap gap-2 mb-6">
            <input
              value={newEventTitle}
              onChange={e => setNewEventTitle(e.target.value)}
              placeholder="Event title"
              className="flex-1 min-w-[200px] h-10 px-3 rounded-lg bg-depth border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
            <input
              type="date"
              value={newEventDate}
              onChange={e => setNewEventDate(e.target.value)}
              className="h-10 px-3 rounded-lg bg-depth border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
            <select
              value={newEventCat}
              onChange={e => setNewEventCat(e.target.value)}
              className="h-10 px-3 rounded-lg bg-depth border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            >
              {['Technical', 'Cultural', 'Sports', 'Placement', 'Social', 'Exam'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (newEventTitle && newEventDate) {
                  setEvents(prev => [...prev, { title: newEventTitle, date: newEventDate, category: newEventCat }]);
                  setNewEventTitle('');
                  setNewEventDate('');
                }
              }}
              className="h-10 px-4 rounded-lg bg-primary/20 text-primary border border-primary/30 font-ui text-[10px] tracking-wider hover:bg-primary/30 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> ADD
            </button>
          </div>

          {/* Events list */}
          <div className="space-y-2">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-depth border border-border">
                <div>
                  <span className="text-sm text-foreground">{ev.title}</span>
                  <span className="ml-3 text-[10px] text-text-3 font-mono">{ev.date}</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-ui tracking-wider border border-border text-text-3">{ev.category}</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-lift text-text-3 hover:text-foreground transition-all">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEvents(prev => prev.filter((_, j) => j !== i))}
                    className="p-1.5 rounded hover:bg-nova/20 text-text-3 hover:text-nova transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTab;
