import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Clock, Users, Bus, HeartPulse, FileText, RotateCcw } from 'lucide-react';

const FAQ: Record<string, string> = {
  "library location": "The Central Library is in the heart of campus. Switch to 🗺️ NAVIGATE tab and click 'Central Library' for exact directions.",
  "library timings": "Library: Mon–Fri 8AM–8PM, Sat 9AM–5PM, Sun Closed. Check the live status beacon for real-time status.",
  "canteen timings": "Main Canteen: Mon–Sat 7:30AM–9PM, Sun 9AM–6PM. The status beacon shows if it's currently open.",
  "mess timings": "Mess sessions — Breakfast: 7–9AM, Lunch: 11:30AM–2:30PM, Snacks: 4–5:30PM, Dinner: 7–9:30PM.",
  "hostel curfew": "Boys Hostel curfew: 9:30 PM. Girls Hostel curfew: 8:30 PM. Gates open at 5:30 AM daily.",
  "hod contact": "Check the 📋 HOD Directory flip card on the right panel for department-wise contacts.",
  "exam schedule": "Exam schedules are posted on the 📅 EVENTS tab. Filter by 'Exam' category for upcoming dates.",
  "bus timings": "College buses depart from the Main Gate at 7:15AM, 8:00AM, 8:30AM. Return trips at 4:30PM and 5:15PM.",
  "wifi password": "Campus WiFi: Network 'SJCE_STUDENT' or 'SJIT_STUDENT'. Contact IT Help Desk at extension 2201 for credentials.",
  "medical emergency": "Medical Centre: weekdays 8:30AM–5:30PM, Sat 9AM–1PM. Emergency line: 044-2450-0900.",
  "placement": "Placement Cell is open Mon–Fri 9AM–5PM. Visit the EVENTS tab for upcoming placement drives.",
  "sports ground": "Sports Ground is open daily from 6AM–7PM. Equipment can be borrowed from the Physical Education office.",
  "admin block": "Admin Block: Mon–Fri 9AM–5PM, Sat 9AM–1PM. For official queries, visit with your ID card.",
  "fee payment": "Fee payments can be made at the Admin Block counter or online via the college portal.",
  "transport info": "Bus routes cover OMR, ECR, Velachery, Tambaram, and T.Nagar. Check the Transport card for full routes.",
  "grievance": "Submit grievances through the 📝 Grievance Form flip card. Anonymous submissions are accepted.",
  "seminar hall": "Seminar Hall booking: Contact Admin Block. Capacity: 800 (SJCE), 600 (SJIT).",
  "parking": "Two-wheeler parking near Main Gate. Car parking behind Admin Block. Display your vehicle pass.",
  "id card lost": "Report lost ID cards at Admin Block immediately. Replacement fee: ₹200. Temporary pass issued same day.",
  "attendance": "Minimum 75% attendance required. Check your attendance on the college portal or contact your class advisor.",
};

const quickQuestions = [
  "Where is the library?",
  "Canteen timings?",
  "Hostel curfew?",
  "Bus timings?",
  "Mess timings?",
  "Medical emergency?",
];

interface Message {
  from: 'user' | 'bot';
  text: string;
}

function matchQuery(input: string): string {
  const lower = input.toLowerCase();
  let bestScore = 0;
  let bestAnswer = "I'm not sure about that. Try asking about library timings, canteen hours, hostel curfew, bus routes, or medical help. You can also check the flip cards on the right for quick info!";

  for (const [key, answer] of Object.entries(FAQ)) {
    const words = key.split(' ');
    let score = 0;
    for (const w of words) {
      if (lower.includes(w)) score += 1;
    }
    score = score / Math.max(words.length, lower.split(' ').length);
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = answer;
    }
  }
  return bestScore >= 0.3 ? bestAnswer : bestAnswer;
}

interface FlipCardData {
  icon: React.ReactNode;
  label: string;
  color: string;
  content: React.ReactNode;
}

const HelpDeskTab = () => {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Welcome to Campus Help Desk! Ask me anything about SJCE or SJIT — timings, locations, contacts, or use the quick questions below." },
  ]);
  const [input, setInput] = useState('');
  const [flipped, setFlipped] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg: Message = { from: 'user', text: msg };
    const botMsg: Message = { from: 'bot', text: matchQuery(msg) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => setMessages(prev => [...prev, botMsg]), 400);
  };

  const flipCards: FlipCardData[] = [
    {
      icon: <Phone className="w-6 h-6" />,
      label: 'Emergency Contacts',
      color: 'hsl(var(--nova))',
      content: (
        <div className="space-y-2 text-xs">
          <p><strong>Security:</strong> 044-2450-0901</p>
          <p><strong>Medical:</strong> 044-2450-0900</p>
          <p><strong>Fire:</strong> 101</p>
          <p><strong>Ambulance:</strong> 108</p>
          <p><strong>Women Helpline:</strong> 181</p>
          <p><strong>Police:</strong> 100</p>
        </div>
      ),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Office Hours',
      color: 'hsl(var(--solar))',
      content: (
        <div className="space-y-2 text-xs">
          <p><strong>Admin:</strong> Mon–Fri 9AM–5PM</p>
          <p><strong>Library:</strong> Mon–Fri 8AM–8PM</p>
          <p><strong>Placement:</strong> Mon–Fri 9AM–5PM</p>
          <p><strong>Medical:</strong> Mon–Fri 8:30AM–5:30PM</p>
          <p><strong>Accounts:</strong> Mon–Fri 10AM–4PM</p>
        </div>
      ),
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'HOD Directory',
      color: 'hsl(var(--aurora-1))',
      content: (
        <div className="space-y-2 text-xs">
          <p><strong>CSE:</strong> Dr. S. Kumar — ext. 2101</p>
          <p><strong>ECE:</strong> Dr. R. Priya — ext. 2102</p>
          <p><strong>MECH:</strong> Dr. V. Rajan — ext. 2103</p>
          <p><strong>CIVIL:</strong> Dr. M. Devi — ext. 2104</p>
          <p><strong>IT:</strong> Dr. K. Selvam — ext. 2105</p>
        </div>
      ),
    },
    {
      icon: <Bus className="w-6 h-6" />,
      label: 'Transport Info',
      color: 'hsl(var(--aurora-3))',
      content: (
        <div className="space-y-2 text-xs">
          <p><strong>Route 1:</strong> Tambaram → OMR</p>
          <p><strong>Route 2:</strong> Velachery → OMR</p>
          <p><strong>Route 3:</strong> T.Nagar → OMR</p>
          <p><strong>Departure:</strong> 7:15, 8:00, 8:30 AM</p>
          <p><strong>Return:</strong> 4:30, 5:15 PM</p>
        </div>
      ),
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      label: 'Medical Help',
      color: 'hsl(var(--nova))',
      content: (
        <div className="space-y-2 text-xs">
          <p><strong>Campus Clinic:</strong> Ground Floor, Admin Block area</p>
          <p><strong>Doctor:</strong> Dr. S. Lakshmi</p>
          <p><strong>Hours:</strong> 8:30AM–5:30PM (Mon–Fri)</p>
          <p><strong>Emergency:</strong> 044-2450-0900</p>
          <p><strong>Nearest Hospital:</strong> SRM Hospital, OMR</p>
        </div>
      ),
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'Grievance Form',
      color: 'hsl(var(--aurora-2))',
      content: (
        <div className="space-y-2 text-xs">
          <p>Submit grievances anonymously.</p>
          <p><strong>Academic:</strong> Contact your class advisor first</p>
          <p><strong>Hostel:</strong> Warden's office</p>
          <p><strong>Ragging:</strong> Anti-ragging cell: 044-2450-0905</p>
          <p><strong>Online:</strong> college portal → grievance section</p>
        </div>
      ),
    },
  ];

  return (
    <div className="tab-enter max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chat Panel */}
        <div className="flex-1 lg:w-[55%] glass-card p-4 flex flex-col" style={{ minHeight: '500px', maxHeight: '70vh' }}>
          <div className="font-ui text-[10px] tracking-widest text-text-2 mb-3">CAMPUS ASSISTANT</div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                   style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${
                  msg.from === 'user'
                    ? 'bg-primary/20 border border-primary/30 text-foreground'
                    : 'bg-lift border border-border text-foreground'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-full text-[10px] font-ui tracking-wider border border-primary/30 text-text-2 hover:bg-primary/10 hover:text-foreground hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about timings, locations, contacts..."
              className="flex-1 h-12 px-4 rounded-xl bg-depth border border-border text-foreground placeholder:text-text-3 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <button
              onClick={() => handleSend()}
              className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Flip Cards Grid */}
        <div className="lg:w-[45%] grid grid-cols-2 gap-4">
          {flipCards.map((card, i) => (
            <div
              key={i}
              className="cursor-pointer"
              style={{ perspective: '1000px', animationDelay: `${i * 0.08}s` }}
              onClick={() => setFlipped(flipped === i ? null : i)}
            >
              <div
                className="relative w-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped === i ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
                  minHeight: '160px',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 glass-card flex flex-col items-center justify-center gap-3 p-4"
                  style={{ backfaceVisibility: 'hidden', borderTop: `3px solid ${card.color}` }}
                >
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <span className="font-ui text-[10px] tracking-widest text-text-2">{card.label.toUpperCase()}</span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 glass-card p-4 overflow-y-auto"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderTop: `3px solid ${card.color}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-ui text-[10px] tracking-widest" style={{ color: card.color }}>{card.label.toUpperCase()}</span>
                    <RotateCcw className="w-3 h-3 text-text-3" />
                  </div>
                  <div className="text-text-2">{card.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpDeskTab;
