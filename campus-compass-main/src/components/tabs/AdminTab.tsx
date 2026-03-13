import { useState, useEffect, useRef } from 'react';
import { Lock, Building2, LayoutGrid, FileText, BarChart3, Plus, Trash2, Edit, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEvents, CampusEvent } from '@/store/eventsStore';
import AdminFeedbackPanel from './AdminFeedbackPanel';

const CORRECT_USER = 'admin';
const CORRECT_PASS = 'campus2025';

type CollegeType = 'SJCE' | 'SJIT' | 'CIT';

interface NewEventForm {
  title: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  capacity: string;
  college: CollegeType;
}

const AdminTab = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<'buildings' | 'floorplans' | 'content' | 'analytics' | 'feedback'>('analytics');

  const [events, addEvent, deleteEvent] = useEvents();

  const [form, setForm] = useState<NewEventForm>({
    title: '', date: '', time: '09:00', venue: '', category: 'Technical', capacity: '200', college: 'SJCE',
  });

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
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-full" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--aurora-1) / 0.05) 2px, hsl(var(--aurora-1) / 0.05) 4px)',
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
              className={`w-full h-11 px-4 rounded-lg bg-muted/30 border font-mono text-sm text-primary placeholder:text-muted-foreground/30 focus:outline-none transition-all ${
                authError ? 'border-destructive' : 'border-border focus:border-primary/50'
              }`}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(false); }}
              placeholder="PASSWORD"
              className={`w-full h-11 px-4 rounded-lg bg-muted/30 border font-mono text-sm text-primary placeholder:text-muted-foreground/30 focus:outline-none transition-all ${
                authError ? 'border-destructive' : 'border-border focus:border-primary/50'
              }`}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {authError && (
            <div className="mt-3 font-mono text-xs text-destructive text-center animate-fade-up">
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

          <p className="mt-4 text-center text-[10px] text-muted-foreground/30 font-mono">
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
    feedback: { icon: <MessageCircle className="w-4 h-4" />, label: 'FEEDBACK DATA' },
  };

  const handleAddEvent = () => {
    if (!form.title || !form.date || !form.venue) return;
    addEvent({
      title: form.title,
      date: form.date,
      time: form.time,
      venue: form.venue,
      college: form.college,
      category: form.category,
      capacity: parseInt(form.capacity) || 200,
      registered: 0,
    });
    toast.success(`Event added to ${form.college} events successfully`, {
      description: form.title,
    });
    setForm({ title: '', date: '', time: '09:00', venue: '', category: 'Technical', capacity: '200', college: 'SJCE' });
  };

  return (
    <div className="tab-enter max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Object.entries(panels).map(([key, { icon, label }]) => (
          <button
            key={key}
            onClick={() => setActivePanel(key as typeof activePanel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[10px] tracking-wider transition-all hover:-translate-y-0.5 ${
              activePanel === key ? 'bg-primary/20 text-primary border border-primary/30' : 'glass-card text-muted-foreground/40'
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
        <button
          onClick={() => { setAuthenticated(false); setUsername(''); setPassword(''); }}
          className="ml-auto px-4 py-2.5 rounded-lg text-muted-foreground/40 border border-border font-ui text-[10px] tracking-wider hover:text-destructive hover:border-destructive/30 transition-all"
        >
          LOGOUT
        </button>
      </div>

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
              <div className="font-ui text-[9px] tracking-widest text-muted-foreground/30">{stat.label}</div>
              <svg viewBox="0 0 80 20" className="w-full h-4 mt-3 opacity-40">
                <polyline
                  fill="none" stroke={stat.color} strokeWidth="1.5" strokeLinecap="round"
                  points={Array.from({ length: 7 }, (_, j) => `${j * 13},${10 + Math.sin(j * 1.2 + stat.value * 0.01) * 8}`).join(' ')}
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {activePanel === 'buildings' && (
        <div className="glass-card p-6">
          <div className="text-center py-12 text-muted-foreground/30">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-ui text-xs tracking-wider mb-2">MAP EDIT MODE</p>
            <p className="text-xs">Click on the Navigate map to add new building markers.</p>
          </div>
        </div>
      )}

      {activePanel === 'floorplans' && (
        <div className="glass-card p-6">
          <div className="text-center py-12 text-muted-foreground/30">
            <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-ui text-xs tracking-wider mb-2">FLOOR PLAN BUILDER</p>
            <p className="text-xs">Draw rooms on the SVG grid. Assign types, names, and capacities.</p>
          </div>
        </div>
      )}

      {activePanel === 'content' && (
        <div className="glass-card p-6">
          <div className="font-ui text-[10px] tracking-widest text-muted-foreground/40 mb-5">EVENT MANAGER</div>

          {/* College toggle */}
          <div className="mb-4">
            <div className="inline-flex rounded-xl glass border border-border p-1 gap-1">
            {(['SJCE', 'SJIT', 'CIT'] as CollegeType[]).map((col) => (
                <button
                  key={col}
                  onClick={() => setForm(f => ({ ...f, college: col }))}
                  className={`px-5 py-2 rounded-lg font-ui text-[10px] tracking-widest transition-all duration-200 ${
                    form.college === col
                      ? col === 'SJCE'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : col === 'SJIT'
                        ? 'bg-secondary/20 text-secondary border border-secondary/30'
                        : 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-muted-foreground/40 hover:text-foreground'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Add event form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Event title *"
              className="h-10 px-3 rounded-lg bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 col-span-full"
            />
            <input
              value={form.venue}
              onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
              placeholder="Venue *"
              className="h-10 px-3 rounded-lg bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="h-10 px-3 rounded-lg bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
            <input
              type="time"
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="h-10 px-3 rounded-lg bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
            <input
              type="number"
              value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
              placeholder="Capacity"
              className="h-10 px-3 rounded-lg bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="h-10 px-3 rounded-lg bg-muted/20 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50"
            >
              {['Technical', 'Cultural', 'Sports', 'Placement', 'Social', 'Exam'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddEvent}
            className="mb-6 px-5 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30 font-ui text-[10px] tracking-wider hover:bg-primary/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> ADD EVENT TO {form.college}
          </button>

          {/* Events list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate block">{ev.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground/40 font-mono">{ev.date} {ev.time}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-ui tracking-wider border border-border text-muted-foreground/40">{ev.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-ui tracking-wider border ${
                      ev.college === 'SJCE' ? 'border-primary/30 text-primary' : ev.college === 'SJIT' ? 'border-secondary/30 text-secondary' : 'border-accent/30 text-accent'
                    }`}>{ev.college}</span>
                    {ev.addedByAdmin && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-ui tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">ADMIN</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button className="p-1.5 rounded hover:bg-muted/30 text-muted-foreground/30 hover:text-foreground transition-all">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground/30 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePanel === 'feedback' && <AdminFeedbackPanel />}
    </div>
  );
};

export default AdminTab;
