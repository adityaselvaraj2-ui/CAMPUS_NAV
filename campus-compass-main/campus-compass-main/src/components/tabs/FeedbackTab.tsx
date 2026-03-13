import { useState, useMemo } from 'react';
import { Campus } from '@/data/campusData';
import { ChevronRight, ChevronLeft, Send } from 'lucide-react';

const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const moodEmojis = ['😤', '😟', '😐', '🙂', '😊', '🤩'];
const moodLabels = ['Terrible', 'Poor', 'Okay', 'Good', 'Great', 'Amazing'];
const moodColors = [
  'hsl(var(--nova))', 'hsl(355 80% 55%)', 'hsl(var(--solar))',
  'hsl(120 50% 50%)', 'hsl(var(--aurora-3))', 'hsl(50 100% 55%)'
];

// Simulated feedback data
const wordCloudData = [
  { word: 'clean', count: 45, sentiment: 'positive' },
  { word: 'crowded', count: 38, sentiment: 'negative' },
  { word: 'helpful', count: 52, sentiment: 'positive' },
  { word: 'wifi', count: 30, sentiment: 'negative' },
  { word: 'library', count: 48, sentiment: 'neutral' },
  { word: 'canteen', count: 42, sentiment: 'neutral' },
  { word: 'parking', count: 25, sentiment: 'negative' },
  { word: 'labs', count: 35, sentiment: 'positive' },
  { word: 'sports', count: 28, sentiment: 'positive' },
  { word: 'maintenance', count: 20, sentiment: 'negative' },
  { word: 'friendly', count: 40, sentiment: 'positive' },
  { word: 'AC', count: 33, sentiment: 'negative' },
];

const buildingRankings = [
  { name: 'Central Library', score: 4.5 },
  { name: 'CSE Block', score: 4.2 },
  { name: 'Main Canteen', score: 3.8 },
  { name: 'Seminar Hall', score: 4.1 },
  { name: 'Sports Ground', score: 4.6 },
  { name: 'Admin Block', score: 3.4 },
  { name: 'Medical Centre', score: 3.9 },
];

interface FeedbackTabProps {
  campus: Campus;
}

const FeedbackTab = ({ campus }: FeedbackTabProps) => {
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [moodValue, setMoodValue] = useState(3);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<'gauge' | 'rankings' | 'words'>('gauge');

  const moodIdx = Math.min(Math.round(moodValue / 5 * 5), 5);
  const overallScore = 4.1;
  const gaugeAngle = (overallScore / 5) * 180;

  const sortedRankings = useMemo(() =>
    [...buildingRankings].sort((a, b) => b.score - a.score),
    []
  );

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(0);
      setDept('');
      setYear('');
      setComment('');
      setMoodValue(3);
      setSelectedBuilding('');
    }, 3000);
  };

  const steps = [
    // Step 0: Identity
    <div key="identity" className="space-y-6">
      <h3 className="font-display text-lg font-bold text-foreground">Who are you?</h3>
      <div>
        <label className="font-ui text-[9px] tracking-widest text-text-3 mb-2 block">DEPARTMENT</label>
        <div className="grid grid-cols-5 gap-2">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`py-3 rounded-lg font-ui text-[10px] tracking-wider transition-all hover:-translate-y-0.5 ${
                dept === d ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-depth border border-border text-text-3'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="font-ui text-[9px] tracking-widest text-text-3 mb-2 block">YEAR</label>
        <div className="flex gap-2">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`flex-1 py-2.5 rounded-lg font-ui text-[10px] tracking-wider transition-all hover:-translate-y-0.5 ${
                year === y ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-depth border border-border text-text-3'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => setAnonymous(!anonymous)}
          className={`w-10 h-5 rounded-full transition-all ${anonymous ? 'bg-primary' : 'bg-depth border border-border'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-foreground mt-0.5 transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-xs text-text-2">Submit anonymously</span>
      </label>
    </div>,

    // Step 1: Building
    <div key="building" className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground">What are you rating?</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
        {campus.buildings.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBuilding(b.name)}
            className={`p-3 rounded-lg text-left transition-all hover:-translate-y-0.5 ${
              selectedBuilding === b.name ? 'bg-primary/20 border border-primary/30' : 'bg-depth border border-border'
            }`}
          >
            <span className="text-lg">{b.icon}</span>
            <div className="font-ui text-[9px] tracking-wider text-text-2 mt-1">{b.name.toUpperCase()}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Mood
    <div key="mood" className="space-y-6">
      <h3 className="font-display text-lg font-bold text-foreground">How was your experience?</h3>
      <div className="text-center">
        <div className="text-6xl mb-3" style={{ transition: 'all 0.3s' }}>{moodEmojis[moodIdx]}</div>
        <div className="font-ui text-sm tracking-wider mb-6" style={{ color: moodColors[moodIdx] }}>
          {moodLabels[moodIdx]}
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={moodValue}
          onChange={e => setMoodValue(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(var(--aurora-1)/0.5)]"
          style={{
            background: `linear-gradient(90deg, hsl(var(--nova)), hsl(var(--solar)), hsl(var(--aurora-3)), hsl(50 100% 55%))`,
          }}
        />
        <div className="flex justify-between font-mono text-[9px] text-text-3 mt-1">
          <span>😤</span><span>😐</span><span>🤩</span>
        </div>
      </div>
    </div>,

    // Step 3: Comment
    <div key="comment" className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground">Any details to share?</h3>
      <div className="relative">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Tell us what went well or could be improved..."
          className="w-full p-4 rounded-xl bg-depth border border-border text-foreground placeholder:text-text-3 font-body text-sm resize-none focus:outline-none focus:border-primary/50 transition-all"
        />
        <span className={`absolute bottom-3 right-3 font-mono text-[10px] ${comment.length > 400 ? 'text-nova' : 'text-text-3'}`}>
          {comment.length}/500
        </span>
      </div>
    </div>,

    // Step 4: Submit
    <div key="submit" className="text-center py-8">
      {submitted ? (
        <div className="animate-fade-up">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="font-display text-xl font-bold text-aurora-3 mb-2">Thank You!</h3>
          <p className="text-text-2 text-sm">Your feedback helps improve campus life.</p>
        </div>
      ) : (
        <>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Ready to submit?</h3>
          <div className="glass-card p-4 text-left mb-6 text-sm space-y-1">
            <p className="text-text-2"><span className="text-text-3">Dept:</span> {dept || 'N/A'} · {year || 'N/A'}</p>
            <p className="text-text-2"><span className="text-text-3">Building:</span> {selectedBuilding || 'N/A'}</p>
            <p className="text-text-2"><span className="text-text-3">Rating:</span> {moodEmojis[moodIdx]} {moodLabels[moodIdx]}</p>
            {comment && <p className="text-text-2"><span className="text-text-3">Comment:</span> {comment.slice(0, 80)}...</p>}
          </div>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-primary/20 text-primary border border-primary/30 font-ui text-xs tracking-widest hover:bg-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 mx-auto"
          >
            <Send className="w-4 h-4" />
            SUBMIT FEEDBACK
          </button>
        </>
      )}
    </div>,
  ];

  return (
    <div className="tab-enter max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="flex-1 glass-card p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {['Identity', 'Location', 'Rating', 'Comment', 'Submit'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] ${
                  i <= step ? 'bg-primary/20 text-primary' : 'bg-depth text-text-3'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < 4 && <div className={`w-6 h-px ${i < step ? 'bg-primary/40' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          <div className="min-h-[300px]">
            {steps[step]}
          </div>

          {/* Navigation */}
          {!submitted && (
            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-text-3 text-xs font-ui tracking-wider disabled:opacity-30 hover:text-text-2 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
              {step < 4 && (
                <button
                  onClick={() => setStep(Math.min(4, step + 1))}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs font-ui tracking-wider hover:bg-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  NEXT <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="lg:w-80">
          <div className="glass-card p-4">
            <div className="flex gap-1 mb-4">
              {(['gauge', 'rankings', 'words'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAnalyticsTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg font-ui text-[9px] tracking-wider transition-all ${
                    analyticsTab === tab ? 'bg-primary/20 text-primary' : 'text-text-3'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {analyticsTab === 'gauge' && (
              <div className="text-center py-4">
                <svg viewBox="0 0 200 120" className="w-48 mx-auto">
                  {/* Arc background */}
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--depth))" strokeWidth="12" strokeLinecap="round" />
                  {/* Arc fill */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(gaugeAngle / 180) * 251} 251`}
                  />
                  <defs>
                    <linearGradient id="gaugeGrad">
                      <stop offset="0%" stopColor="hsl(var(--nova))" />
                      <stop offset="50%" stopColor="hsl(var(--solar))" />
                      <stop offset="100%" stopColor="hsl(var(--aurora-3))" />
                    </linearGradient>
                  </defs>
                  <text x="100" y="90" textAnchor="middle" fill="hsl(var(--text-1))" fontSize="28" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                    {overallScore.toFixed(1)}
                  </text>
                  <text x="100" y="110" textAnchor="middle" fill="hsl(var(--text-3))" fontSize="10" fontFamily="Orbitron, sans-serif">
                    / 5.0
                  </text>
                </svg>
                <div className="font-ui text-[10px] tracking-widest text-text-3 mt-2">OVERALL SATISFACTION</div>
              </div>
            )}

            {analyticsTab === 'rankings' && (
              <div className="space-y-3 py-2">
                {sortedRankings.map((b, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-2">{b.name}</span>
                      <span className="font-mono text-text-3">{b.score.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-depth overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(b.score / 5) * 100}%`,
                          background: b.score >= 4.0 ? 'hsl(var(--aurora-3))' : b.score >= 3.5 ? 'hsl(var(--solar))' : 'hsl(var(--nova))',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {analyticsTab === 'words' && (
              <div className="flex flex-wrap gap-2 py-2 justify-center">
                {wordCloudData.map((w, i) => (
                  <span
                    key={i}
                    className="font-body transition-transform hover:scale-110 cursor-default"
                    style={{
                      fontSize: `${10 + (w.count / 52) * 14}px`,
                      color: w.sentiment === 'positive' ? 'hsl(var(--aurora-3))' :
                             w.sentiment === 'negative' ? 'hsl(var(--nova))' : 'hsl(var(--text-2))',
                      opacity: 0.5 + (w.count / 52) * 0.5,
                    }}
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackTab;
