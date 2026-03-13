import { useState, useEffect } from 'react';

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  college: 'SJCE' | 'SJIT' | 'CIT';
  category: string;
  capacity: number;
  registered: number;
  addedByAdmin: boolean;
}

const STORAGE_KEY = 'campus_events';

const INITIAL_EVENTS: CampusEvent[] = [
  { id:'e1', title:"JOSE 2025 — National Symposium", date:"2025-03-15", time:"09:00", venue:"Seminar Hall", college:"SJCE", category:"Technical", capacity:400, registered:287, addedByAdmin:false },
  { id:'e2', title:"Industry Expert Talk — AI/ML", date:"2025-03-08", time:"14:00", venue:"Seminar Hall", college:"SJCE", category:"Technical", capacity:200, registered:178, addedByAdmin:false },
  { id:'e3', title:"Inter-College Cricket Tournament", date:"2025-03-22", time:"08:00", venue:"Sports Ground", college:"SJCE", category:"Sports", capacity:500, registered:340, addedByAdmin:false },
  { id:'e4', title:"Placement Drive — TCS", date:"2025-03-05", time:"09:00", venue:"Admin Block", college:"SJCE", category:"Placement", capacity:300, registered:298, addedByAdmin:false },
  { id:'e5', title:"Workshop: Full Stack Dev", date:"2025-03-18", time:"10:00", venue:"CSE Block", college:"SJCE", category:"Technical", capacity:60, registered:58, addedByAdmin:false },
  { id:'e6', title:"Semester End Exams Begin", date:"2025-04-20", time:"09:00", venue:"Exam Hall", college:"SJCE", category:"Exam", capacity:2000, registered:1876, addedByAdmin:false },
  { id:'e7', title:"Alumni Meet 2025", date:"2025-05-03", time:"17:00", venue:"Seminar Hall", college:"SJCE", category:"Social", capacity:500, registered:234, addedByAdmin:false },
  { id:'e8', title:"Freshers Day Celebration", date:"2025-02-20", time:"10:00", venue:"Sports Ground", college:"SJIT", category:"Cultural", capacity:800, registered:612, addedByAdmin:false },
  { id:'e9', title:"Annual Cultural Fest — JOSTLE", date:"2025-04-10", time:"09:00", venue:"Sports Ground", college:"SJIT", category:"Cultural", capacity:1200, registered:987, addedByAdmin:false },
  { id:'e10', title:"Blood Donation Camp", date:"2025-03-12", time:"09:00", venue:"Medical Centre", college:"SJIT", category:"Social", capacity:200, registered:143, addedByAdmin:false },
  { id:'e11', title:"SJIT Tech Symposium 2025", date:"2025-03-20", time:"09:30", venue:"Seminar Hall B", college:"SJIT", category:"Technical", capacity:350, registered:210, addedByAdmin:false },
  { id:'e12', title:"SJIT Placement Drive — Infosys", date:"2025-03-10", time:"09:00", venue:"Admin Block SJIT", college:"SJIT", category:"Placement", capacity:250, registered:220, addedByAdmin:false },
  { id:'e13', title:"CIT Tech Expo 2025", date:"2025-03-20", time:"09:00", venue:"CIT Seminar Hall", college:"CIT", category:"Technical", capacity:350, registered:201, addedByAdmin:false },
  { id:'e14', title:"Placement Drive — Infosys", date:"2025-03-10", time:"09:00", venue:"CIT Admin Block", college:"CIT", category:"Placement", capacity:250, registered:238, addedByAdmin:false },
  { id:'e15', title:"CIT Cultural Night — SPECTRUM", date:"2025-04-05", time:"17:00", venue:"CIT Open Air Stage", college:"CIT", category:"Cultural", capacity:1000, registered:867, addedByAdmin:false },
  { id:'e16', title:"Workshop: Machine Learning Bootcamp", date:"2025-03-25", time:"10:00", venue:"CIT CSE Lab", college:"CIT", category:"Technical", capacity:80, registered:74, addedByAdmin:false },
  { id:'e17', title:"CIT End Semester Exams", date:"2025-04-22", time:"09:00", venue:"CIT Exam Halls", college:"CIT", category:"Exam", capacity:1500, registered:1421, addedByAdmin:false },
  { id:'e18', title:"Inter-Department Sports Meet", date:"2025-03-28", time:"08:00", venue:"CIT Sports Ground", college:"CIT", category:"Sports", capacity:400, registered:312, addedByAdmin:false },
];

function loadEvents(): CampusEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return INITIAL_EVENTS;
}

function saveEvents(events: CampusEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

type Listener = (events: CampusEvent[]) => void;
const listeners = new Set<Listener>();
let globalEvents: CampusEvent[] = loadEvents();

function notifyAll(updated: CampusEvent[]) {
  globalEvents = updated;
  saveEvents(updated);
  listeners.forEach(l => l(updated));
}

export function addEvent(partial: Omit<CampusEvent, 'id' | 'addedByAdmin'>): CampusEvent {
  const newEvent: CampusEvent = { ...partial, id: Date.now().toString(), addedByAdmin: true };
  notifyAll([...globalEvents, newEvent]);
  return newEvent;
}

export function deleteEvent(id: string) {
  notifyAll(globalEvents.filter(e => e.id !== id));
}

export function useEvents(): [CampusEvent[], typeof addEvent, typeof deleteEvent] {
  const [events, setEvents] = useState<CampusEvent[]>(globalEvents);
  useEffect(() => {
    const listener: Listener = (updated) => setEvents([...updated]);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);
  return [events, addEvent, deleteEvent];
}
