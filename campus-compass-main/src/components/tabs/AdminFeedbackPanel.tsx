import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

const moodEmojis = ['😤', '😟', '😐', '🙂', '😊', '🤩'];

interface FeedbackEntry {
  _id: string;
  campus: string;
  department: string;
  year: string;
  anonymous: boolean;
  building: string;
  mood: number;
  comment: string;
  createdAt: string;
}

const AdminFeedbackPanel = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SJCE' | 'SJIT' | 'CIT'>('ALL');
  const [avgMood, setAvgMood] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const res = await fetch(`${API}/api/feedback`);
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
        setAvgMood(data.avgMood);
        setTotalCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const filtered = filter === 'ALL' ? feedbacks : feedbacks.filter(f => f.campus === filter);
  const topBuilding = filtered.length
    ? Object.entries(
        filtered.reduce((acc: Record<string, number[]>, f) => {
          if (f.building) { acc[f.building] = [...(acc[f.building] || []), f.mood]; }
          return acc;
        }, {})
      ).map(([name, scores]) => ({ name, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
        .sort((a, b) => b.avg - a.avg)[0]?.name || '—'
    : '—';

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'TOTAL SUBMISSIONS', value: totalCount.toString() },
          { label: 'AVG MOOD', value: `${moodEmojis[Math.min(Math.round(avgMood), 5)]} ${avgMood.toFixed(1)}` },
          { label: 'TOP RATED', value: topBuilding.length > 15 ? topBuilding.slice(0, 15) + '…' : topBuilding },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <div className="font-ui text-[8px] tracking-widest text-text-3 mb-1">{stat.label}</div>
            <div className="font-display text-lg font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['ALL', 'SJCE', 'SJIT', 'CIT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-ui text-[9px] tracking-widest transition-all ${
                filter === f ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-3 hover:text-text-2'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-text-3 hover:text-primary font-ui text-[9px] tracking-widest transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="font-ui text-[10px] tracking-widest text-text-3 animate-pulse">LOADING FEEDBACK...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <TrendingUp className="w-8 h-8 text-text-3 mx-auto mb-2" />
          <div className="font-ui text-[10px] tracking-widest text-text-3">NO FEEDBACK YET</div>
          <div className="text-xs text-text-3 mt-1">Submissions will appear here in real-time</div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-depth border-b border-border">
                <tr>
                  {['CAMPUS', 'BUILDING', 'DEPT', 'YEAR', 'MOOD', 'COMMENT', 'DATE'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-ui text-[8px] tracking-widest text-text-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={f._id} className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${i % 2 === 0 ? '' : 'bg-depth/30'}`}>
                    <td className="px-3 py-2 font-ui text-[9px] tracking-wider text-primary">{f.campus}</td>
                    <td className="px-3 py-2 text-text-2 max-w-[120px] truncate">{f.building || '—'}</td>
                    <td className="px-3 py-2 text-text-3">{f.department || '—'}</td>
                    <td className="px-3 py-2 text-text-3">{f.year || '—'}</td>
                    <td className="px-3 py-2 text-lg">{moodEmojis[Math.min(Math.round(f.mood), 5)]}</td>
                    <td className="px-3 py-2 text-text-2 max-w-[200px]">
                      <span className="truncate block" title={f.comment}>{f.comment || '—'}</span>
                    </td>
                    <td className="px-3 py-2 text-text-3 whitespace-nowrap">
                      {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackPanel;
