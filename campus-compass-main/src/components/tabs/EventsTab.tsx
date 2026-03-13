import { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';
import { useEvents } from '@/store/eventsStore';
import { useCountdown } from '@/hooks/useCountdown';

type CampusProp = 'SJCE' | 'SJIT' | 'CIT' | null;

interface EventsTabProps {
  campus: CampusProp;
}

const categories = ["All", "Technical", "Cultural", "Sports", "Placement", "Social", "Exam"];

const EventsTab = ({ campus }: EventsTabProps) => {
  const [events, , deleteEvent] = useEvents();
  const [filter, setFilter] = useState('All');
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());

  const now = new Date();

  const campusEvents = useMemo(() => {
    if (!campus) return [];
    return [...events]
      .filter(e => e.college === campus)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, campus]);

  const nextEvent = campusEvents.find(e => new Date(e.date) > now);
  const countdown = useCountdown(nextEvent?.date || '2099-12-31');

  const filtered = filter === 'All' ? campusEvents : campusEvents.filter(e => e.category === filter);

  const handleRsvp = (id: string) => {
    setRsvpd(prev => new Set([...prev, id]));
  };

  if (!campus) {
    return (
      <div className="tab-enter max-w-6xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center gap-4">
        <Calendar className="w-12 h-12 text-muted-foreground/20" />
        <p className="font-ui text-xs tracking-widest text-muted-foreground/40">NO CAMPUS SELECTED</p>
        <p className="text-sm text-muted-foreground/30 max-w-xs">
          Select your campus on the Home tab to see its events.
        </p>
      </div>
    );
  }

  return (
    <div className="tab-enter max-w-6xl mx-auto px-4 py-6">
      {/* Countdown Banner */}
      {nextEvent && (
        <div className="glass-card p-6 mb-8 text-center">
          <div className="font-ui text-[10px] tracking-widest text-muted-foreground/40 mb-2">NEXT {campus} EVENT</div>
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
                <div className="font-ui text-[8px] tracking-widest text-muted-foreground/30 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground/30 shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-ui tracking-wider whitespace-nowrap transition-all hover:-translate-y-0.5 active:translate-y-0 ${
              filter === cat
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'border border-border text-muted-foreground/40 hover:text-foreground'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/30 font-ui text-xs tracking-widest">
          NO {filter !== 'All' ? filter.toUpperCase() + ' ' : ''}EVENTS FOR {campus}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((event, i) => {
            const isPast = new Date(event.date) < now;
            const isRsvpd = rsvpd.has(event.id);
            const fillPct = Math.round((event.registered / event.capacity) * 100);

            return (
              <div
                key={event.id}
                className={`glass-card overflow-hidden transition-all duration-300 animate-fade-up ${isPast ? 'opacity-50 saturate-50' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Category bar */}
                <div className="h-1" style={{
                  background: event.category === 'Technical' ? 'hsl(var(--aurora-1))' :
                               event.category === 'Cultural' ? 'hsl(var(--aurora-2))' :
                               event.category === 'Sports' ? 'hsl(var(--aurora-3))' :
                               event.category === 'Placement' ? 'hsl(var(--solar))' :
                               'hsl(var(--muted-foreground) / 0.3)'
                }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-2">
                      <h3 className="font-display font-bold text-foreground text-sm mb-1">{event.title}</h3>
                      <div className="flex items-center gap-3 text-muted-foreground/50 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-mono">{event.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-ui tracking-wider border border-border text-muted-foreground/40">
                        {event.college}
                      </span>
                      {event.addedByAdmin && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-ui tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground/50">
                    <MapPin className="w-3 h-3" />
                    <span>{event.venue}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <Users className="w-3 h-3" />
                    <span>{event.registered}/{event.capacity}</span>
                  </div>

                  <div className="h-1 rounded-full bg-muted mb-4 overflow-hidden">
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
                      onClick={() => handleRsvp(event.id)}
                      disabled={isRsvpd}
                      className={`w-full py-2.5 rounded-lg font-ui text-[10px] tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                        isRsvpd
                          ? 'bg-accent/20 text-accent border border-accent/30'
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
      )}
    </div>
  );
};

export default EventsTab;
