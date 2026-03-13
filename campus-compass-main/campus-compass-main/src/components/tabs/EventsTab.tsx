import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';

interface CampusEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
  college: string;
  category: string;
  capacity: number;
  registered: number;
}

const EVENTS: CampusEvent[] = [
  { title: "JOSE 2025 — National Symposium", date: "2025-03-15", time: "09:00", venue: "Seminar Hall", college: "SJCE", category: "Technical", capacity: 400, registered: 287 },
  { title: "Freshers Day Celebration", date: "2025-02-20", time: "10:00", venue: "Sports Ground", college: "SJIT", category: "Cultural", capacity: 800, registered: 612 },
  { title: "Industry Expert Talk — AI/ML", date: "2025-03-08", time: "14:00", venue: "Seminar Hall", college: "SJCE", category: "Technical", capacity: 200, registered: 178 },
  { title: "Inter-College Cricket Tournament", date: "2025-03-22", time: "08:00", venue: "Sports Ground", college: "SJCE", category: "Sports", capacity: 500, registered: 340 },
  { title: "Placement Drive — TCS", date: "2025-03-05", time: "09:00", venue: "Admin Block", college: "SJCE", category: "Placement", capacity: 300, registered: 298 },
  { title: "Annual Cultural Fest — JOSTLE", date: "2025-04-10", time: "09:00", venue: "Sports Ground", college: "SJIT", category: "Cultural", capacity: 1200, registered: 987 },
  { title: "Workshop: Full Stack Dev", date: "2025-03-18", time: "10:00", venue: "CSE Block", college: "SJCE", category: "Technical", capacity: 60, registered: 58 },
  { title: "Blood Donation Camp", date: "2025-03-12", time: "09:00", venue: "Medical Centre", college: "SJIT", category: "Social", capacity: 200, registered: 143 },
  { title: "Semester End Exams Begin", date: "2025-04-20", time: "09:00", venue: "Admin Block", college: "SJCE", category: "Exam", capacity: 2000, registered: 1876 },
  { title: "Alumni Meet 2025", date: "2025-05-03", time: "17:00", venue: "Seminar Hall", college: "SJCE", category: "Social", capacity: 500, registered: 234 },
];

const categories = ["All", "Technical", "Cultural", "Sports", "Placement", "Social", "Exam"];

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

const EventsTab = () => {
  const [filter, setFilter] = useState('All');
  const [rsvpd, setRsvpd] = useState<Set<number>>(new Set());

  const now = new Date();
  const sorted = useMemo(() =>
    [...EVENTS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    []
  );

  const nextEvent = sorted.find(e => new Date(e.date) > now);
  const countdown = useCountdown(nextEvent?.date || '2025-12-31');

  const filtered = filter === 'All' ? sorted : sorted.filter(e => e.category === filter);

  const handleRsvp = (idx: number) => {
    setRsvpd(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  return (
    <div className="tab-enter max-w-6xl mx-auto px-4 py-6">
      {/* Countdown Banner */}
      {nextEvent && (
        <div className="glass-card p-6 mb-8 text-center">
          <div className="font-ui text-[10px] tracking-widest text-text-3 mb-2">NEXT EVENT</div>
          <div className="font-display text-lg sm:text-xl font-bold text-foreground mb-4">{nextEvent.title}</div>
          <div className="flex justify-center gap-4">
            {[
              { value: countdown.days, label: 'DAYS' },
              { value: countdown.hours, label: 'HRS' },
              { value: countdown.minutes, label: 'MIN' },
              { value: countdown.seconds, label: 'SEC' },
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <div className="font-mono text-2xl sm:text-4xl font-bold text-primary tabular-nums w-16 text-center">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="font-ui text-[8px] tracking-widest text-text-3 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-text-3 shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-ui tracking-wider whitespace-nowrap transition-all hover:-translate-y-0.5 active:translate-y-0 ${
              filter === cat
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'border border-border text-text-3 hover:text-text-2'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((event, i) => {
          const isPast = new Date(event.date) < now;
          const globalIdx = EVENTS.indexOf(event);
          const isRsvpd = rsvpd.has(globalIdx);
          const fillPct = Math.round((event.registered / event.capacity) * 100);

          return (
            <div
              key={i}
              className={`glass-card overflow-hidden transition-all duration-300 animate-fade-up ${
                isPast ? 'opacity-50 saturate-50' : ''
              }`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Category bar */}
              <div className="h-1" style={{
                background: event.category === 'Technical' ? 'hsl(var(--aurora-1))' :
                             event.category === 'Cultural' ? 'hsl(var(--aurora-2))' :
                             event.category === 'Sports' ? 'hsl(var(--aurora-3))' :
                             event.category === 'Placement' ? 'hsl(var(--solar))' :
                             'hsl(var(--text-3))'
              }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm mb-1">{event.title}</h3>
                    <div className="flex items-center gap-3 text-text-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-mono">{event.time}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-ui tracking-wider border border-border text-text-3">
                    {event.college}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-text-2">
                  <MapPin className="w-3 h-3" />
                  <span>{event.venue}</span>
                  <span className="text-text-3">·</span>
                  <Users className="w-3 h-3" />
                  <span>{event.registered}/{event.capacity}</span>
                </div>

                {/* Capacity bar */}
                <div className="h-1 rounded-full bg-depth mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct > 90 ? 'hsl(var(--nova))' : fillPct > 60 ? 'hsl(var(--solar))' : 'hsl(var(--aurora-3))',
                    }}
                  />
                </div>

                {!isPast && (
                  <button
                    onClick={() => handleRsvp(globalIdx)}
                    disabled={isRsvpd}
                    className={`w-full py-2.5 rounded-lg font-ui text-[10px] tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                      isRsvpd
                        ? 'bg-aurora-3/20 text-aurora-3 border border-aurora-3/30'
                        : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                    }`}
                  >
                    {isRsvpd ? '✓ REGISTERED' : 'RSVP NOW'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsTab;
