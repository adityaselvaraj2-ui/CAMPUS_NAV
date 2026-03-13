import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Phone, Clock, Users, Bus, HeartPulse, FileText, RotateCcw, HelpCircle, Loader2, Mic } from 'lucide-react';
import { campuses } from '@/data/campusData';

type CampusProp = 'SJCE' | 'SJIT' | 'CIT' | null;
type MessageType = 'user' | 'bot' | 'error' | 'loading';

interface HelpDeskTabProps {
  campus: CampusProp;
}

interface Message { 
  from: MessageType; 
  text: string;
  error?: boolean;
}

interface RealtimeData {
  events: string[];
  notices: string[];
  openFacilities: string[];
  weather: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// FAQ data remains the same
const FAQ_COMMON: Record<string, string> = {
  "exam schedule": "Exam schedules are on the 📅 EVENTS tab. Filter by 'Exam' category.",
  "attendance": "Minimum 75% attendance required. Check your attendance on the college portal.",
  "id card lost": "Report lost ID cards at the Admin Block. Replacement fee: ₹200.",
  "grievance": "Submit grievances through the 📝 Grievance Form flip card.",
  "medical emergency": "Contact the campus Medical Centre immediately or call 108.",
};

const FAQ_SJCE: Record<string, string> = {
  "library location": "SJCE Library is in Block A, ground floor. Use 🗺️ NAVIGATE → 'Central Library'.",
  "library timings": "SJCE Library: Mon–Fri 8AM–8PM, Sat 9AM–5PM, Sun Closed.",
  "canteen timings": "SJCE Main Canteen: Mon–Sat 7:30AM–9PM, Sun 9AM–6PM.",
  "mess timings": "SJCE Mess: Breakfast 7–9AM, Lunch 11:30AM–2:30PM, Snacks 4–5:30PM, Dinner 7–9:30PM.",
  "hostel curfew": "SJCE Boys Hostel: 9:30PM. Girls Hostel: 8:30PM. Gates open 5:30AM.",
  "bus timings": "SJCE buses depart Main Gate: 7:15AM, 8:00AM, 8:30AM. Return: 4:30PM, 5:15PM.",
  "wifi password": "SJCE WiFi: 'SJCE_STUDENT'. Contact IT Help Desk ext. 2201 for credentials.",
  "hod contact": "See the 📋 HOD Directory flip card for SJCE department-wise contacts.",
  "placement": "SJCE Placement Cell: Mon–Fri 9AM–5PM. Check EVENTS for upcoming drives.",
  "seminar hall": "SJCE Seminar Hall capacity: 800. Booking via Admin Block.",
  "sports ground": "SJCE Sports Ground open daily 6AM–7PM. Equipment from PE office.",
  "parking": "SJCE: Two-wheeler near Main Gate, car parking behind Admin Block.",
  "transport info": "SJCE buses cover OMR, ECR, Velachery, Tambaram, T.Nagar.",
  "fee payment": "SJCE fees: Admin Block counter or college online portal.",
};

const FAQ_SJIT: Record<string, string> = {
  "library location": "SJIT Library is in the Main Block, 1st floor. Use 🗺️ NAVIGATE → 'SJIT Library'.",
  "library timings": "SJIT Library: Mon–Fri 8:30AM–7:30PM, Sat 9AM–4PM, Sun Closed.",
  "canteen timings": "SJIT Canteen: Mon–Sat 8AM–8:30PM, Sun 9AM–5PM.",
  "mess timings": "SJIT Mess: Breakfast 7:30–9AM, Lunch 12–2PM, Snacks 4:30–5:30PM, Dinner 7:30–9PM.",
  "hostel curfew": "SJIT Boys Hostel: 9:00PM. Girls Hostel: 8:00PM. Gates open 5:45AM.",
  "bus timings": "SJIT buses depart from SJIT Gate: 7:20AM, 8:10AM, 8:45AM. Return: 4:45PM, 5:30PM.",
  "wifi password": "SJIT WiFi: 'SJIT_STUDENT'. Contact SJIT IT Desk ext. 3201 for credentials.",
  "hod contact": "See the 📋 HOD Directory flip card for SJIT department-wise contacts.",
  "placement": "SJIT Placement Cell: Mon–Fri 9AM–5PM. Check EVENTS tab for upcoming drives.",
  "seminar hall": "SJIT Seminar Hall capacity: 600. Booking via SJIT Admin Block.",
  "sports ground": "SJIT Sports Ground open daily 6AM–7PM. Equipment from SJIT PE dept.",
  "parking": "SJIT: Two-wheeler near SJIT Gate, four-wheeler in designated area Block C.",
  "transport info": "SJIT buses cover Sholinganallur, Perungudi, Guindy, Porur, Ambattur.",
  "fee payment": "SJIT fees: SJIT Admin counter or SJIT online portal.",
};

const FAQ_CIT: Record<string, string> = {
  "library location": "CIT Library is in the Academic Block, ground floor. Use 🗺️ NAVIGATE → 'CIT Library'.",
  "library timings": "CIT Library: Mon–Fri 8AM–7PM, Sat 9AM–3PM, Sun Closed.",
  "canteen timings": "CIT Canteen: Mon–Sat 7:45AM–8PM, Sun Closed.",
  "mess timings": "CIT Mess: Breakfast 7–9AM, Lunch 12–2:30PM, Snacks 4–5PM, Dinner 7–9PM.",
  "hostel curfew": "CIT Boys Hostel: 9:30PM. Girls Hostel: 8:30PM. Gates open 5:30AM.",
  "bus timings": "CIT buses depart from CIT Main Entrance: 7:10AM, 8:00AM, 8:40AM. Return: 4:30PM, 5:00PM.",
  "wifi password": "CIT WiFi: 'CIT_STUDENT'. Contact CIT IT Help Desk ext. 4201 for credentials.",
  "hod contact": "See the 📋 HOD Directory flip card for CIT department-wise contacts.",
  "placement": "CIT Placement Cell: Mon–Fri 9AM–5PM. Check EVENTS tab for drives.",
  "seminar hall": "CIT Seminar Hall capacity: 500. Booking via CIT Admin Office.",
  "sports ground": "CIT Sports Ground open daily 6AM–7PM. Equipment from CIT PE dept.",
  "parking": "CIT: Two-wheeler near CIT Gate, car parking in Annex Block.",
  "transport info": "CIT buses cover Anna Nagar, Koyambedu, Vadapalani, Ashok Nagar, Mogappair.",
  "fee payment": "CIT fees: CIT Admin Block or the CIT student portal.",
};

const QUICK_CHIPS: Record<NonNullable<CampusProp>, string[]> = {
  SJCE: ["What events today?", "Canteen timings?", "Hostel curfew?", "Bus timings?", "Open facilities?"],
  SJIT: ["What events today?", "Canteen timings?", "Hostel curfew?", "Bus timings?", "Open facilities?"],
  CIT:  ["What events today?", "Canteen timings?", "Hostel curfew?", "Bus timings?", "Open facilities?"],
};

function getActiveFAQ(campus: CampusProp): Record<string, string> {
  return {
    ...FAQ_COMMON,
    ...(campus === 'SJCE' ? FAQ_SJCE : campus === 'SJIT' ? FAQ_SJIT : campus === 'CIT' ? FAQ_CIT : {}),
  };
}

function matchQuery(input: string, campus: CampusProp): string {
  const faq = getActiveFAQ(campus);
  const lower = input.toLowerCase();
  let bestScore = 0;
  let bestAnswer = "I'm not sure about that. Try asking about library timings, canteen hours, hostel curfew, bus routes, or medical help.";
  for (const [key, answer] of Object.entries(faq)) {
    const words = key.split(' ');
    let score = 0;
    for (const w of words) { if (lower.includes(w)) score += 1; }
    score = score / Math.max(words.length, lower.split(' ').length);
    if (score > bestScore) { bestScore = score; bestAnswer = answer; }
  }
  return bestAnswer;
}

const BADGE_COLORS: Record<NonNullable<CampusProp>, { bg: string; border: string; text: string }> = {
  SJCE: { bg: 'hsl(var(--aurora-1) / 0.1)', border: 'hsl(var(--aurora-1) / 0.3)', text: 'hsl(var(--aurora-1))' },
  SJIT: { bg: 'hsl(var(--aurora-2) / 0.1)', border: 'hsl(var(--aurora-2) / 0.3)', text: 'hsl(var(--aurora-2))' },
  CIT:  { bg: 'hsl(var(--aurora-3) / 0.1)', border: 'hsl(var(--aurora-3) / 0.3)', text: 'hsl(var(--aurora-3))' },
};

const HelpDeskTab = ({ campus }: HelpDeskTabProps) => {
  const welcomeMsg = campus === 'SJCE'
    ? "Welcome to the SJCE Help Desk! Ask me anything about St. Joseph's College of Engineering — timings, locations, or contacts. I'm powered by Groq AI! 🚀"
    : campus === 'SJIT'
    ? "Welcome to the SJIT Help Desk! Ask me anything about St. Joseph's Institute of Technology — timings, locations, or contacts. I'm powered by Groq AI! 🚀"
    : campus === 'CIT'
    ? "Welcome to the CIT Help Desk! Ask me anything about Chennai Institute of Technology — timings, locations, or contacts. I'm powered by Groq AI! 🚀"
    : "Please select your campus on the Home tab to get campus-specific help.";

  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: welcomeMsg }]);
  const [input, setInput] = useState('');
  const [flipped, setFlipped] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [useGroq, setUseGroq] = useState(true);
  const [dynamicChips, setDynamicChips] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Build campus context for AI
  const campusContext = useMemo(() => {
    const data = campuses.find(c =>
      (campus === 'SJCE' && c.id === 'sjce') ||
      (campus === 'SJIT' && c.id === 'sjit') ||
      (campus === 'CIT' && c.id === 'cit')
    );
    if (!data) return '';

    const buildingList = data.buildings.map(b => {
      const schedParts: string[] = [];
      if (b.schedule?.weekday) schedParts.push(`Weekdays: ${b.schedule.weekday.open}–${b.schedule.weekday.close}`);
      if (b.schedule?.saturday) schedParts.push(`Sat: ${b.schedule.saturday.open}${b.schedule.saturday.close ? '–' + b.schedule.saturday.close : ''}`);
      if (b.schedule?.sunday) schedParts.push(`Sun: ${b.schedule.sunday.open}`);
      const sched = schedParts.length ? ` | Hours: ${schedParts.join(', ')}` : '';
      return `- ${b.name} (${b.icon}): ${b.description} | Category: ${b.category} | Floors: ${b.floors ?? 'N/A'} | Capacity: ${b.capacity ?? 'N/A'}${sched}`;
    }).join('\n');

    return `Campus: ${data.name} (${data.shortName})
Location center: lat ${data.center[0]}, lng ${data.center[1]}

BUILDINGS & FACILITIES:
${buildingList}`;
  }, [campus]);

  // Fetch real-time data on mount and campus change
  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/realtime-data?campus=${campus}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRealtimeData(data.data);
            console.log('✅ Real-time data fetched:', data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
        // Continue without real-time data
      }
    };

    setMessages([{ from: 'bot', text: welcomeMsg }]);
    setDynamicChips(quickQuestions || []);
    if (campus) {
      fetchRealtimeData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campus]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!campus) {
    return (
      <div className="tab-enter max-w-7xl mx-auto px-4 py-24 text-center">
        <HelpCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
        <p className="font-ui tracking-widest text-muted-foreground/40 text-sm">SELECT YOUR CAMPUS ON THE HOME TAB TO GET CAMPUS-SPECIFIC HELP</p>
      </div>
    );
  }

  const badge = BADGE_COLORS[campus];
  const quickQuestions = QUICK_CHIPS[campus];

  // Get contextual chips based on bot response
  function getContextualChips(botReply: string, campus: CampusProp): string[] {
    const lower = botReply.toLowerCase();
    if (lower.includes('library')) return ["Library timings?", "Library wifi?", "Digital resources?"];
    if (lower.includes('canteen') || lower.includes('mess')) return ["Mess timings?", "Menu today?", "Hostel mess vs canteen?"];
    if (lower.includes('bus') || lower.includes('transport')) return ["Return timings?", "Route map?", "TNSTC buses?"];
    if (lower.includes('hostel')) return ["Hostel curfew?", "Hostel fee?", "Hostel wifi?"];
    if (lower.includes('placement') || lower.includes('drive')) return ["Eligibility criteria?", "Next drive?", "Mock interview?"];
    if (lower.includes('exam')) return ["Hall ticket?", "Results portal?", "Re-evaluation process?"];
    return campus ? QUICK_CHIPS[campus].slice(0, 3) : [];
  }

  // Typewriter effect for bot messages
  async function typewriterEffect(text: string) {
    let displayed = '';
    for (let i = 0; i < text.length; i++) {
      displayed += text[i];
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { from: 'bot', text: displayed };
        return updated;
      });
      await new Promise(r => setTimeout(r, 12));
    }
  }

  // Voice input function
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { from: 'bot', text: "Voice input isn't supported in your browser. Try Chrome." }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const sendToGroqAPI = async (userMessage: string, conversationHistory: Message[]) => {
    try {
      // Use relative URL since Vite proxy will forward to backend
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          campus: campus,
          campusContext: campusContext   // <-- pass full campus knowledge
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Backend API Error:', error);
        throw new Error(error.message || 'Failed to get response from backend API');
      }

      const data = await response.json();
      if (!data.success || typeof data.reply !== 'string') {
        throw new Error(data.message || 'Invalid response from backend API');
      }
      return data.reply;
    } catch (error) {
      console.error('Backend API Error:', error);
      throw error;
    }
  };

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { from: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add loading indicator
    setMessages(prev => [...prev, { from: 'loading', text: 'Thinking...' }]);

    try {
      let botResponse: string;

      if (useGroq) {
        // Use Groq API with backstops
        try {
          botResponse = await sendToGroqAPI(msg, [...messages, userMsg]);
        } catch (groqError) {
          console.warn('Groq API failed, falling back to FAQ:', groqError);
          botResponse = matchQuery(msg, campus);
        }
      } else {
        // Fallback to FAQ matching
        botResponse = matchQuery(msg, campus);
      }

      setMessages(prev => {
        // Remove loading message and add bot response placeholder
        return [
          ...prev.slice(0, -1),
          { from: 'bot', text: '' }
        ];
      });
      
      // Use typewriter effect for bot response
      await typewriterEffect(botResponse);
      
      // Update contextual chips based on response
      setDynamicChips(getContextualChips(botResponse, campus));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        return [
          ...prev.slice(0, -1),
          {
            from: 'error',
            text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. You can try asking something else or use the info cards on the right.`,
            error: true
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const flipCards = [
    {
      icon: <Phone className="w-6 h-6" />,
      label: 'Emergency Contacts',
      color: 'hsl(var(--nova))',
      content: (
        <div className="space-y-2 text-xs">
          <p><strong>Security:</strong> {campus === 'SJCE' ? '044-2450-0901' : campus === 'SJIT' ? '044-2250-1901' : '044-2680-5901'}</p>
          <p><strong>Medical:</strong> {campus === 'SJCE' ? '044-2450-0900' : campus === 'SJIT' ? '044-2250-1900' : '044-2680-5900'}</p>
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
          <p><strong>Library:</strong> {campus === 'SJCE' ? 'Mon–Fri 8AM–8PM' : campus === 'SJIT' ? 'Mon–Fri 8:30AM–7:30PM' : 'Mon–Fri 8AM–7PM'}</p>
          <p><strong>Placement:</strong> Mon–Fri 9AM–5PM</p>
          <p><strong>Medical:</strong> {campus === 'SJCE' ? 'Mon–Fri 8:30AM–5:30PM' : campus === 'SJIT' ? 'Mon–Fri 9AM–5PM' : 'Mon–Fri 9AM–4:30PM'}</p>
          <p><strong>Accounts:</strong> Mon–Fri 10AM–4PM</p>
        </div>
      ),
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'HOD Directory',
      color: 'hsl(var(--aurora-1))',
      content: campus === 'SJCE' ? (
        <div className="space-y-2 text-xs">
          <p><strong>CSE:</strong> Dr. S. Kumar — ext. 2101</p>
          <p><strong>ECE:</strong> Dr. R. Priya — ext. 2102</p>
          <p><strong>MECH:</strong> Dr. V. Rajan — ext. 2103</p>
          <p><strong>CIVIL:</strong> Dr. M. Devi — ext. 2104</p>
          <p><strong>IT:</strong> Dr. K. Selvam — ext. 2105</p>
        </div>
      ) : campus === 'SJIT' ? (
        <div className="space-y-2 text-xs">
          <p><strong>CSE:</strong> Dr. A. Mehta — ext. 3101</p>
          <p><strong>ECE:</strong> Dr. B. Rao — ext. 3102</p>
          <p><strong>MECH:</strong> Dr. C. Nair — ext. 3103</p>
          <p><strong>CIVIL:</strong> Dr. D. Iyer — ext. 3104</p>
          <p><strong>IT:</strong> Dr. E. Patel — ext. 3105</p>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <p><strong>CSE:</strong> Dr. P. Krishnan — ext. 4101</p>
          <p><strong>ECE:</strong> Dr. Q. Sudha — ext. 4102</p>
          <p><strong>MECH:</strong> Dr. R. Arjun — ext. 4103</p>
          <p><strong>CIVIL:</strong> Dr. S. Kavitha — ext. 4104</p>
          <p><strong>IT:</strong> Dr. T. Mohan — ext. 4105</p>
        </div>
      ),
    },
    {
      icon: <Bus className="w-6 h-6" />,
      label: 'Transport Info',
      color: 'hsl(var(--aurora-3))',
      content: campus === 'SJCE' ? (
        <div className="space-y-2 text-xs">
          <p><strong>Route 1:</strong> Tambaram → OMR</p>
          <p><strong>Route 2:</strong> Velachery → OMR</p>
          <p><strong>Route 3:</strong> T.Nagar → OMR</p>
          <p><strong>Departure:</strong> 7:15, 8:00, 8:30 AM</p>
          <p><strong>Return:</strong> 4:30, 5:15 PM</p>
        </div>
      ) : campus === 'SJIT' ? (
        <div className="space-y-2 text-xs">
          <p><strong>Route 1:</strong> Sholinganallur → SJIT</p>
          <p><strong>Route 2:</strong> Guindy → SJIT</p>
          <p><strong>Route 3:</strong> Porur → SJIT</p>
          <p><strong>Departure:</strong> 7:20, 8:10, 8:45 AM</p>
          <p><strong>Return:</strong> 4:45, 5:30 PM</p>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <p><strong>Route 1:</strong> Anna Nagar → CIT</p>
          <p><strong>Route 2:</strong> Koyambedu → CIT</p>
          <p><strong>Route 3:</strong> Mogappair → CIT</p>
          <p><strong>Departure:</strong> 7:10, 8:00, 8:40 AM</p>
          <p><strong>Return:</strong> 4:30, 5:00 PM</p>
        </div>
      ),
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      label: 'Medical Help',
      color: 'hsl(var(--nova))',
      content: campus === 'SJCE' ? (
        <div className="space-y-2 text-xs">
          <p><strong>Clinic:</strong> Ground Floor, Admin Block</p>
          <p><strong>Doctor:</strong> Dr. S. Lakshmi</p>
          <p><strong>Hours:</strong> 8:30AM–5:30PM (Mon–Fri)</p>
          <p><strong>Emergency:</strong> 044-2450-0900</p>
          <p><strong>Nearest:</strong> SRM Hospital, OMR</p>
        </div>
      ) : campus === 'SJIT' ? (
        <div className="space-y-2 text-xs">
          <p><strong>Clinic:</strong> 1st Floor, Main Block</p>
          <p><strong>Doctor:</strong> Dr. R. Anitha</p>
          <p><strong>Hours:</strong> 9AM–5PM (Mon–Fri)</p>
          <p><strong>Emergency:</strong> 044-2250-1900</p>
          <p><strong>Nearest:</strong> Kauvery Hospital</p>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <p><strong>Clinic:</strong> Ground Floor, Academic Block</p>
          <p><strong>Doctor:</strong> Dr. M. Sheela</p>
          <p><strong>Hours:</strong> 9AM–4:30PM (Mon–Fri)</p>
          <p><strong>Emergency:</strong> 044-2680-5900</p>
          <p><strong>Nearest:</strong> Apollo Hospital Mogappair</p>
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
          <p><strong>Ragging:</strong> {campus === 'SJCE' ? '044-2450-0905' : campus === 'SJIT' ? '044-2250-1905' : '044-2680-5905'}</p>
          <p><strong>Online:</strong> {campus} portal → grievance section</p>
        </div>
      ),
    },
  ];

  return (
    <div className="tab-enter max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="px-3 py-1 rounded-full font-ui text-[9px] tracking-widest border"
          style={{ background: badge.bg, borderColor: badge.border, color: badge.text }}
        >
          {campus} HELP DESK {useGroq ? '✨ GROQ AI' : '(FAQ MODE)'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chat Panel */}
        <div className="flex-1 lg:w-[55%] glass-card p-4 flex flex-col" style={{ minHeight: '500px', maxHeight: '70vh' }}>
          <div className="font-ui text-[10px] tracking-widest text-muted-foreground/50 mb-3">CAMPUS ASSISTANT {realtimeData && '· LIVE DATA ENABLED'}</div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {msg.from === 'loading' ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${
                    msg.from === 'user'
                      ? 'bg-primary/20 border border-primary/30 text-foreground'
                      : msg.from === 'error'
                      ? 'bg-destructive/20 border border-destructive/30 text-foreground'
                      : 'glass border border-border text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {dynamicChips.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full text-[10px] font-ui tracking-wider border border-primary/30 text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder={`Ask about ${campus} timings, locations, contacts...`}
              disabled={isLoading}
              className="flex-1 h-12 px-4 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground/40 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
            />
            <button
              onClick={startVoiceInput}
              disabled={isLoading || isListening}
              aria-label="Voice input"
              className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all
                ${isListening
                  ? 'bg-nova/30 border-nova/50 animate-pulse'
                  : 'bg-muted/30 border-border hover:bg-primary/10'}`}
            >
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              aria-label="Send message"
              className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Flip Cards Grid */}
        <div className="lg:w-[45%] grid grid-cols-2 gap-4">
          {flipCards.map((card, i) => (
            <div
              key={i}
              className="cursor-pointer"
              style={{ perspective: '1000px' }}
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
                <div
                  className="absolute inset-0 glass-card flex flex-col items-center justify-center gap-3 p-4"
                  style={{ backfaceVisibility: 'hidden', borderTop: `3px solid ${card.color}` }}
                >
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <span className="font-ui text-[10px] tracking-widest text-muted-foreground/50">{card.label.toUpperCase()}</span>
                </div>
                <div
                  className="absolute inset-0 glass-card p-4 overflow-y-auto"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderTop: `3px solid ${card.color}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-ui text-[10px] tracking-widest" style={{ color: card.color }}>{card.label.toUpperCase()}</span>
                    <RotateCcw className="w-3 h-3 text-muted-foreground/30" />
                  </div>
                  <div className="text-muted-foreground">{card.content}</div>
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
