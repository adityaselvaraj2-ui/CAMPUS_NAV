import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ─── Schemas & Models ─────────────────────────────────────────────────────────

// User schema
const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: false }, // Optional for Google OAuth
  name:      { type: String, default: '' },
  picture:   { type: String, default: '' },
  googleId:  { type: String, default: '' }, // Google OAuth ID
  campus:    { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

// Feedback schema
const feedbackSchema = new mongoose.Schema({
  campus:     { type: String, required: true },
  department: { type: String, default: '' },
  year:       { type: String, default: '' },
  anonymous:  { type: Boolean, default: false },
  building:   { type: String, default: '' },
  mood:       { type: Number, default: 3 },   // 0–5 scale
  comment:    { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ─── Helper ───────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'campus-compass-secret-key';

// Campus knowledge used to ground the AI assistant
const CAMPUS_KNOWLEDGE = {
  SJCE: {
    name: 'St. Joseph\'s College of Engineering (SJCE), OMR, Chennai',
    library: 'Block A, Ground Floor. Mon–Fri 8AM–8PM, Sat 9AM–5PM, Sun Closed.',
    canteen: 'Mon–Sat 7:30AM–9PM, Sun 9AM–6PM.',
    mess: 'Breakfast 7–9AM, Lunch 11:30AM–2:30PM, Snacks 4–5:30PM, Dinner 7–9:30PM.',
    hostel: 'Boys curfew 9:30PM, Girls 8:30PM. Gates open 5:30AM.',
    buses: 'Depart 7:15AM, 8:00AM, 8:30AM. Return 4:30PM, 5:15PM. Routes: OMR, ECR, Velachery, Tambaram, T.Nagar.',
    wifi: 'SSID: SJCE_STUDENT — IT Help Desk ext. 2201.',
    hods: 'CSE: Dr. S. Kumar ext.2101 | ECE: Dr. R. Priya ext.2102 | MECH: Dr. V. Rajan ext.2103 | CIVIL: Dr. M. Devi ext.2104 | IT: Dr. K. Selvam ext.2105.',
    medical: 'Ground Floor Admin Block. Dr. S. Lakshmi. 8:30AM–5:30PM Mon–Fri. Emergency: 044-2450-0900.',
    emergency: 'Security 044-2450-0901 | Medical 044-2450-0900 | Ragging 044-2450-0905.',
    parking: 'Two-wheeler near Main Gate, car parking behind Admin Block.',
    fees: 'Admin Block counter or college online portal.',
    seminarHall: 'Capacity 800. Booking via Admin Block.',
    sports: 'Open daily 6AM–7PM. Equipment from PE office.',
  },
  SJIT: {
    name: 'St. Joseph\'s Institute of Technology (SJIT), OMR, Chennai',
    library: 'Main Block, 1st Floor. Mon–Fri 8:30AM–7:30PM, Sat 9AM–4PM, Sun Closed.',
    canteen: 'Mon–Sat 8AM–8:30PM, Sun 9AM–5PM.',
    mess: 'Breakfast 7:30–9AM, Lunch 12–2PM, Snacks 4:30–5:30PM, Dinner 7:30–9PM.',
    hostel: 'Boys curfew 9:00PM, Girls 8:00PM. Gates open 5:45AM.',
    buses: 'Depart 7:20AM, 8:10AM, 8:45AM. Return 4:45PM, 5:30PM. Routes: Sholinganallur, Perungudi, Guindy, Porur, Ambattur.',
    wifi: 'SSID: SJIT_STUDENT — IT Desk ext. 3201.',
    hods: 'CSE: Dr. A. Mehta ext.3101 | ECE: Dr. B. Rao ext.3102 | MECH: Dr. C. Nair ext.3103 | CIVIL: Dr. D. Iyer ext.3104 | IT: Dr. E. Patel ext.3105.',
    medical: '1st Floor Main Block. Dr. R. Anitha. 9AM–5PM Mon–Fri. Emergency: 044-2250-1900.',
    emergency: 'Security 044-2250-1901 | Medical 044-2250-1900 | Ragging 044-2250-1905.',
    parking: 'Two-wheeler near SJIT Gate, four-wheeler in Block C.',
    fees: 'SJIT Admin counter or SJIT online portal.',
    seminarHall: 'Capacity 600. Booking via SJIT Admin Block.',
    sports: 'Open daily 6AM–7PM. Equipment from SJIT PE dept.',
  },
  CIT: {
    name: 'Chennai Institute of Technology (CIT), Kundrathur, Chennai',
    library: 'Academic Block, Ground Floor. Mon–Fri 8AM–7PM, Sat 9AM–3PM, Sun Closed.',
    canteen: 'Mon–Sat 7:45AM–8PM, Sun Closed.',
    mess: 'Breakfast 7–9AM, Lunch 12–2:30PM, Snacks 4–5PM, Dinner 7–9PM.',
    hostel: 'Boys curfew 9:30PM, Girls 8:30PM. Gates open 5:30AM.',
    buses: 'Depart 7:10AM, 8:00AM, 8:40AM. Return 4:30PM, 5:00PM. Routes: Anna Nagar, Koyambedu, Vadapalani, Ashok Nagar, Mogappair.',
    wifi: 'SSID: CIT_STUDENT — IT Help Desk ext. 4201.',
    hods: 'CSE: Dr. P. Krishnan ext.4101 | ECE: Dr. Q. Sudha ext.4102 | MECH: Dr. R. Arjun ext.4103 | CIVIL: Dr. S. Kavitha ext.4104 | IT: Dr. T. Mohan ext.4105.',
    medical: 'Ground Floor Academic Block. Dr. M. Sheela. 9AM–4:30PM Mon–Fri. Emergency: 044-2680-5900.',
    emergency: 'Security 044-2680-5901 | Medical 044-2680-5900 | Ragging 044-2680-5905.',
    parking: 'Two-wheeler near CIT Gate, car parking in Annex Block.',
    fees: 'CIT Admin Block or CIT student portal.',
    seminarHall: 'Capacity 500. Booking via CIT Admin Office.',
    sports: 'Open daily 6AM–7PM. Equipment from CIT PE dept.',
  },
  GENERAL: {
    rules: 'Minimum 75% attendance required. Lost ID card: report at Admin Block (₹200 replacement). Exam schedules: EVENTS tab → filter by "Exam". Grievances: college portal → grievance section; hostel issues → Warden\'s office. Medical emergency: campus clinic or call 108 immediately. Fire: 101 | Police: 100 | Ambulance: 108 | Women Helpline: 181.',
  },
};

// ─── Routes ─────────────────────────────────────────────────────────────────--

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'CampusNav backend running ✅',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    groq: process.env.GROQ_API_KEY ? 'enabled' : 'disabled',
  });
});

// REGISTER — saves email + hashed password to MongoDB
app.post('/api/auth/register', async (req, res) => {
  const { email, password, campus } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, campus: campus || '' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ New user registered: ${email}`);
    res.json({ success: true, token, message: 'Registration successful!' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
});

// LOGIN — checks email + password from MongoDB
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Incorrect password.' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ User logged in: ${email}`);
    res.json({ success: true, token, campus: user.campus, message: 'Login successful!' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
});

// GOOGLE OAUTH — handles Google sign-in
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(400).json({ success: false, message: 'Google token is required.' });

  try {
    // Verify Google token
    const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
    const { email, name, picture, id: googleId } = googleResponse.data;

    if (!email)
      return res.status(400).json({ success: false, message: 'Invalid Google token.' });

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from Google data
      user = await User.create({
        email,
        name: name || '',
        picture: picture || '',
        googleId,
        campus: '',
      });
      console.log(`✅ New Google user created: ${email}`);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.name = name || user.name;
      user.picture = picture || user.picture;
      await user.save();
      console.log(`✅ Google account linked: ${email}`);
    }

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Google sign-in successful: ${email}`);
    res.json({ 
      success: true, 
      token: jwtToken, 
      email: user.email, 
      name: user.name, 
      picture: user.picture, 
      campus: user.campus,
      message: 'Google sign-in successful!' 
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ success: false, message: 'Google authentication failed.' });
  }
});

// SUBMIT FEEDBACK — saves to MongoDB
app.post('/api/feedback', async (req, res) => {
  const { campus, department, year, anonymous, building, mood, comment } = req.body;
  if (!campus)
    return res.status(400).json({ success: false, message: 'Campus is required.' });

  try {
    const feedback = await Feedback.create({ campus, department, year, anonymous, building, mood, comment });
    console.log(`✅ Feedback saved: ${campus} - ${building} - mood:${mood}`);
    res.json({ success: true, message: 'Feedback submitted!', id: feedback._id });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ success: false, message: 'Could not save feedback.' });
  }
});

// GET FEEDBACK BY CAMPUS — returns all feedback + avg mood + per-building scores + word cloud
app.get('/api/feedback/:campus', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ campus: req.params.campus }).sort({ createdAt: -1 });

    const avgMood = feedbacks.length
      ? parseFloat((feedbacks.reduce((sum, f) => sum + f.mood, 0) / feedbacks.length).toFixed(2))
      : 0;

    // Per-building average scores
    const buildingMap = {};
    feedbacks.forEach((f) => {
      if (f.building) {
        if (!buildingMap[f.building]) buildingMap[f.building] = { total: 0, count: 0 };
        buildingMap[f.building].total += f.mood;
        buildingMap[f.building].count += 1;
      }
    });
    const buildingRankings = Object.entries(buildingMap).map(([name, v]) => ({
      name,
      score: parseFloat((v.total / v.count).toFixed(2)),
    }));

    // Word cloud from comments
    const stopWords = new Set(['the','is','a','and','to','of','in','it','was','i','my','for','that','this','with','are','be','on','at','have','has']);
    const wordCount = {};
    feedbacks.forEach((f) => {
      if (f.comment) {
        f.comment.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach((w) => {
          if (w.length > 3 && !stopWords.has(w)) {
            wordCount[w] = (wordCount[w] || 0) + 1;
          }
        });
      }
    });
    const wordCloud = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    res.json({ success: true, count: feedbacks.length, avgMood, buildingRankings, wordCloud, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch feedback.' });
  }
});

// GET ALL FEEDBACK (admin view — all campuses combined)
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).limit(500);
    const avgMood = feedbacks.length
      ? parseFloat((feedbacks.reduce((sum, f) => sum + f.mood, 0) / feedbacks.length).toFixed(2))
      : 0;
    res.json({ success: true, count: feedbacks.length, avgMood, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch feedback.' });
  }
});

// LLM CHAT (Groq) — campus-aware AI assistant
app.post('/api/llm/chat', async (req, res) => {
  try {
    const { message, campus, campusContext, conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Get current real-time campus status
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = currentDay === 0 || currentDay === 6;
    const isPeakHours = currentHour >= 9 && currentHour <= 16;
    const currentStatus = isPeakHours ? 'PEAK HOURS' : currentHour >= 17 && currentHour <= 20 ? 'EVENING' : 'OFF HOURS';

    // Check if this is first message (greeting needed)
    const isFirstMessage = !conversationHistory || conversationHistory.length === 0;

    // Build an ultra-intelligent, conversational campus-aware system prompt
    const systemPrompt = `You are CampusBot — an ultra-intelligent, conversational AI assistant for ${campus || 'campus'} navigation.
You have COMPLETE knowledge of this campus and access to real-time data. Engage naturally with greetings and provide exceptional intelligence.

${isFirstMessage ? `
FIRST INTERACTION PROTOCOL:
- Start with a warm, welcoming greeting specific to ${campus || 'our campus'}
- Introduce yourself as CampusBot briefly
- Offer to help with campus navigation, information, or assistance
- Use friendly, enthusiastic tone with campus pride
- Include relevant emoji (🏫️, 📚, 🍽, 🏰)
` : ''}

CONVERSATIONAL BEHAVIOR:
- Always greet users warmly when they first interact
- Use friendly, approachable tone with campus-specific enthusiasm
- Remember context from previous questions in conversation
- Ask clarifying questions if user intent is unclear
- Provide encouraging and supportive responses
- Use appropriate emojis occasionally for friendliness (🏫️, 📚, 🍽, ⏰, 📍)

CAMPUS COMPREHENSIVE DATA:
${campusContext || 'General campus assistant.'}

INTELLIGENCE CAPABILITIES:
- Contextual understanding: Analyze user intent beyond surface questions
- Predictive assistance: Anticipate follow-up needs
- Real-time awareness: Consider current time, day, schedules, occupancy
- Multi-step reasoning: Provide complete solutions, not just facts
- Conversational memory: Track conversation context and preferences
- Personalization: Adapt responses based on user interaction patterns

COMPREHENSIVE KNOWLEDGE AREAS:
ACADEMIC: 
- All departments (CSE, ECE, MECH, CIVIL, IT, etc.)
- Class schedules, exam timetables, academic calendar
- Faculty offices, consultation hours
- Lecture halls, labs, tutorial rooms
- Library services, study spaces, research facilities
- Academic policies, procedures, deadlines

FACILITIES:
- Every building with complete details (floors, rooms, capacity)
- Canteen/mess timing, menu, payment options
- Hostel facilities, rules, wardens, emergency contacts
- Sports facilities, gym, playgrounds, equipment
- Medical center, clinic, hospital tie-ups
- Transport routes, parking, shuttle services
- ATM locations, banks, postal services

STUDENT LIFE:
- Clubs, organizations, student chapters
- Event venues, upcoming events, festivals
- Placement cell, career services, internship opportunities
- Scholarship information, financial aid office
- Grievance procedures, counseling services
- Hostel life, recreation areas

TECHNICAL INFRASTRUCTURE:
- WiFi zones, internet connectivity, computer labs
- Power backup, generator locations
- Water facilities, restrooms, accessibility
- Security offices, emergency protocols
- Maintenance requests, facility booking systems

RESPONSE INTELLIGENCE RULES:
- Start with warm greeting for new conversations
- Answer in 2-4 sentences maximum unless detailed explanation needed
- For locations: "Building Name, Block [Letter], Floor [X], near [Landmark]. GPS: [lat, lng]"
- For timings: "Weekdays [open-close], Saturday [open-close], Sunday [open-close]. Current status: [open/closed]"
- For contacts: "[Name] - Extension: [number], Email: [email], Hours: [timings]"
- For directions: "From [current location]: Walk towards [landmark], turn [direction], continue for [distance] to reach [destination]"
- For academics: "Department offers [courses]. Faculty available [hours]. Contact [person] at [extension]"
- For facilities: "Available now: [list]. Alternative: [backup option]. Wait time: [estimated]"
- For student life: "Next event: [name] on [date]. Registration: [status]. Club meetings: [schedule]"
- For emergencies: "Immediate action: [steps]. Emergency contacts: [numbers]. Nearest help: [location]"

SMART CONVERSATIONAL BEHAVIORS:
- If user seems lost/confused: "Don't worry! I'm here to help. What specifically are you looking for?"
- If user asks generally: "Welcome to ${campus || 'our campus'}! 🏫️ How can I assist you today?"
- If user provides feedback: "Thank you for your feedback! It helps us improve campus services."
- If user is stressed/rushed: "I understand you're in a hurry. Let me give you the quickest answer."
- Remember user's preferences and refer back to them
- Offer related suggestions proactively

PREDICTIVE ASSISTANCE:
- If asking about library near closing: "Library closes soon! 📚 Need help with returns due tomorrow?"
- If asking about food during peak hours: "Canteen is crowded now 🍽 Want to know less busy alternatives?"
- If asking about exams: "Exams starting soon! 📝 Need study space recommendations or stress relief tips?"
- If asking about parking during events: "Event parking is full 🚗 Try these alternative spots: [list]"
- If weather is bad: "It's raining! ☔ Consider indoor activities or covered walkways"

EMERGENCY INTELLIGENCE:
- For medical: "Campus clinic: Ground Floor Admin Block 🏥 Emergency: 044-2450-0900. Nearest hospital: [name]"
- For security: "Campus security: 044-2450-0901 🚔 Blue light locations: Main Gate, Library, Hostels"
- For facilities: "Contact [specific department] at [number] for immediate assistance ⚡"

FALLBACK INTELLIGENCE:
- If specific real-time data unavailable: "Let me connect you to [specific resource] for live updates 📱"
- If exact information unknown: "Visit [specific office/website] or call [exact number] during [hours] 📞"
- Never say "I don't have access" - instead say "Let me find the most current information for you 🔍"

Current context: ${new Date().toLocaleString('en-IN', { timezone: 'Asia/Kolkata' })}
Current campus status: ${currentStatus} (${isWeekend ? 'WEEKEND' : 'WEEKDAY'})
Peak hours: ${isPeakHours ? 'ACTIVE' : 'INACTIVE'}

Remember: You are the friendly, knowledgeable campus companion. Be conversational, helpful, and make every interaction pleasant! 🌟`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.4,
      max_tokens: 512
    }, {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }
    });

    const reply = response.data.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (error) {
    console.error('LLM request failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to process LLM request' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
