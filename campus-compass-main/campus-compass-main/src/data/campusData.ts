export type BuildingCategory = 'academic' | 'residential' | 'facility' | 'recreation';

export interface Building {
  id: string;
  name: string;
  icon: string;
  lat: number;
  lng: number;
  category: BuildingCategory;
  description: string;
  floors?: number;
  capacity?: number;
  schedule?: BuildingSchedule;
}

export interface BuildingSchedule {
  type?: 'standard' | 'multi-session' | 'hostel';
  weekday?: { open: string; close: string };
  saturday?: { open: string; close?: string };
  sunday?: { open: string; close?: string };
  alldays?: Record<string, { open: string; close: string }>;
}

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  center: [number, number];
  color: string;
  colorVar: string;
  buildings: Building[];
}

const sjceBuildings: Building[] = [
  { id: 'sjce-main-gate', name: 'Main Gate', icon: '🚪', lat: 12.8530, lng: 80.2262, category: 'facility', description: 'Primary entrance to SJCE campus with security checkpoint.', floors: 1, capacity: 50 },
  { id: 'sjce-admin', name: 'Admin Block', icon: '🏛️', lat: 12.8536, lng: 80.2270, category: 'facility', description: 'Administrative offices, registrar, and principal\'s chamber.', floors: 3, capacity: 200, schedule: { weekday: { open: '09:00', close: '17:00' }, saturday: { open: '09:00', close: '13:00' }, sunday: { open: 'CLOSED' } } },
  { id: 'sjce-library', name: 'Central Library', icon: '📚', lat: 12.8538, lng: 80.2268, category: 'academic', description: 'Three-floor library with 50,000+ volumes and digital archives.', floors: 3, capacity: 500, schedule: { weekday: { open: '08:00', close: '20:00' }, saturday: { open: '09:00', close: '17:00' }, sunday: { open: 'CLOSED' } } },
  { id: 'sjce-cse', name: 'CSE Block', icon: '💻', lat: 12.8681, lng: 80.2166, category: 'academic', description: 'Computer Science & Engineering department with modern labs.', floors: 4, capacity: 600 },
  { id: 'sjce-ece', name: 'ECE Block', icon: '📡', lat: 12.8542, lng: 80.2265, category: 'academic', description: 'Electronics & Communication Engineering department.', floors: 4, capacity: 500 },
  { id: 'sjce-mech', name: 'Mechanical Block', icon: '⚙️', lat: 12.8533, lng: 80.2278, category: 'academic', description: 'Mechanical Engineering with workshops and CAD labs.', floors: 3, capacity: 400 },
  { id: 'sjce-civil', name: 'Civil Block', icon: '🏗️', lat: 12.8529, lng: 80.2275, category: 'academic', description: 'Civil Engineering department with surveying labs.', floors: 3, capacity: 350 },
  { id: 'sjce-it', name: 'IT Block', icon: '🖥️', lat: 12.8544, lng: 80.2260, category: 'academic', description: 'Information Technology department with networking labs.', floors: 3, capacity: 400 },
  { id: 'sjce-boys-hostel', name: 'Boys Hostel', icon: '🏨', lat: 12.8522, lng: 80.2280, category: 'residential', description: 'Residential quarters for male students. 300+ rooms.', floors: 4, capacity: 600, schedule: { type: 'hostel', alldays: { gate: { open: '05:30', close: '21:30' } } } },
  { id: 'sjce-girls-hostel', name: 'Girls Hostel', icon: '🏩', lat: 12.8520, lng: 80.2258, category: 'residential', description: 'Residential quarters for female students with 24/7 security.', floors: 4, capacity: 400, schedule: { type: 'hostel', alldays: { gate: { open: '05:30', close: '20:30' } } } },
  { id: 'sjce-canteen', name: 'Main Canteen', icon: '🍽️', lat: 12.8534, lng: 80.2264, category: 'facility', description: 'Campus cafeteria serving breakfast, lunch, and dinner.', floors: 1, capacity: 300, schedule: { weekday: { open: '07:30', close: '21:00' }, saturday: { open: '08:00', close: '20:00' }, sunday: { open: '09:00', close: '18:00' } } },
  { id: 'sjce-seminar', name: 'Seminar Hall', icon: '🎓', lat: 12.8541, lng: 80.2274, category: 'academic', description: 'Multi-purpose auditorium for events and seminars.', floors: 2, capacity: 800 },
  { id: 'sjce-sports', name: 'Sports Ground', icon: '⚽', lat: 12.8670, lng: 80.2112, category: 'recreation', description: 'Open ground with cricket, football, and basketball courts.', floors: 0, capacity: 1000 },
  { id: 'sjce-placement', name: 'Placement Cell', icon: '💼', lat: 12.8537, lng: 80.2266, category: 'facility', description: 'Career guidance and campus recruitment coordination.', floors: 2, capacity: 100, schedule: { weekday: { open: '09:00', close: '17:00' }, saturday: { open: 'CLOSED' }, sunday: { open: 'CLOSED' } } },
  { id: 'sjce-medical', name: 'Medical Centre', icon: '🏥', lat: 12.8535, lng: 80.2261, category: 'facility', description: 'On-campus health center with first aid and basic treatment.', floors: 1, capacity: 30, schedule: { weekday: { open: '08:00', close: '18:00' }, saturday: { open: '09:00', close: '14:00' }, sunday: { open: 'CLOSED' } } },
];

const sjitBuildings: Building[] = [
  { id: 'sjit-main-gate', name: 'Main Gate', icon: '🚪', lat: 12.8692, lng: 80.2265, category: 'facility', description: 'Primary entrance to SJIT campus.', floors: 1, capacity: 50 },
  { id: 'sjit-admin', name: 'Admin Block', icon: '🏛️', lat: 12.8698, lng: 80.2272, category: 'facility', description: 'Administrative offices and management.', floors: 3, capacity: 180, schedule: { weekday: { open: '09:00', close: '17:00' }, saturday: { open: '09:00', close: '13:00' }, sunday: { open: 'CLOSED' } } },
  { id: 'sjit-library', name: 'Central Library', icon: '📚', lat: 12.8700, lng: 80.2270, category: 'academic', description: 'Modern library with e-resources and study spaces.', floors: 2, capacity: 350, schedule: { weekday: { open: '08:00', close: '20:00' }, saturday: { open: '09:00', close: '17:00' }, sunday: { open: 'CLOSED' } } },
  { id: 'sjit-cse-it', name: 'CSE & IT Block', icon: '💻', lat: 12.8702, lng: 80.2275, category: 'academic', description: 'Combined CSE and IT department with cutting-edge labs.', floors: 4, capacity: 700 },
  { id: 'sjit-ece', name: 'ECE Block', icon: '📡', lat: 12.8704, lng: 80.2268, category: 'academic', description: 'Electronics & Communication Engineering department.', floors: 3, capacity: 400 },
  { id: 'sjit-mech', name: 'Mechanical Block', icon: '⚙️', lat: 12.8695, lng: 80.2280, category: 'academic', description: 'Mechanical Engineering with industrial workshops.', floors: 3, capacity: 350 },
  { id: 'sjit-boys-hostel', name: 'Boys Hostel', icon: '🏨', lat: 12.8685, lng: 80.2283, category: 'residential', description: 'Male student residential block.', floors: 4, capacity: 500 },
  { id: 'sjit-girls-hostel', name: 'Girls Hostel', icon: '🏩', lat: 12.8683, lng: 80.2260, category: 'residential', description: 'Female student residential block with amenities.', floors: 4, capacity: 350 },
  { id: 'sjit-canteen', name: 'Main Canteen', icon: '🍽️', lat: 12.8696, lng: 80.2267, category: 'facility', description: 'Campus food court with multiple cuisines.', floors: 1, capacity: 250, schedule: { weekday: { open: '07:30', close: '21:00' }, saturday: { open: '08:00', close: '20:00' }, sunday: { open: '09:00', close: '18:00' } } },
  { id: 'sjit-seminar', name: 'Seminar Hall', icon: '🎓', lat: 12.8703, lng: 80.2278, category: 'academic', description: 'Conference and seminar auditorium.', floors: 2, capacity: 600 },
  { id: 'sjit-sports', name: 'Sports Ground', icon: '⚽', lat: 12.8688, lng: 80.2272, category: 'recreation', description: 'Multi-sport facility with tracks and courts.', floors: 0, capacity: 800 },
  { id: 'sjit-placement', name: 'Placement Cell', icon: '💼', lat: 12.8699, lng: 80.2269, category: 'facility', description: 'Training & placement office.', floors: 1, capacity: 80, schedule: { weekday: { open: '09:00', close: '17:00' }, saturday: { open: 'CLOSED' }, sunday: { open: 'CLOSED' } } },
  { id: 'sjit-medical', name: 'Medical Centre', icon: '🏥', lat: 12.8697, lng: 80.2263, category: 'facility', description: 'Health center for students and staff.', floors: 1, capacity: 25, schedule: { weekday: { open: '08:00', close: '18:00' }, saturday: { open: '09:00', close: '14:00' }, sunday: { open: 'CLOSED' } } },
];

export const campuses: Campus[] = [
  {
    id: 'sjce',
    name: "St. Joseph's College of Engineering",
    shortName: 'SJCE',
    center: [12.8535, 80.2267],
    color: '#00D2FF',
    colorVar: '--aurora-1',
    buildings: sjceBuildings,
  },
  {
    id: 'sjit',
    name: "St. Joseph's Institute of Technology",
    shortName: 'SJIT',
    center: [12.8697, 80.2270],
    color: '#7B2FFF',
    colorVar: '--aurora-2',
    buildings: sjitBuildings,
  },
];

export function getBuildingStatus(building: Building): { status: 'open' | 'closing' | 'closed' | 'restricted' | 'always'; label: string; color: string } {
  if (!building.schedule) {
    return { status: 'always', label: 'ALWAYS OPEN', color: 'var(--aurora-3)' };
  }

  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  let todaySchedule: { open: string; close?: string } | undefined;

  if (building.schedule.type === 'hostel' && building.schedule.alldays) {
    const gate = building.schedule.alldays.gate;
    if (gate) todaySchedule = gate;
  } else if (day === 0) {
    todaySchedule = building.schedule.sunday;
  } else if (day === 6) {
    todaySchedule = building.schedule.saturday;
  } else {
    todaySchedule = building.schedule.weekday;
  }

  if (!todaySchedule || todaySchedule.open === 'CLOSED') {
    return { status: 'closed', label: 'CLOSED', color: 'var(--nova)' };
  }

  const [openH, openM] = todaySchedule.open.split(':').map(Number);
  const [closeH, closeM] = (todaySchedule.close || '23:59').split(':').map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  if (currentMinutes < openMin) {
    return { status: 'closed', label: `OPENS AT ${todaySchedule.open}`, color: 'var(--nova)' };
  }

  if (currentMinutes >= closeMin) {
    return { status: 'closed', label: 'CLOSED', color: 'var(--nova)' };
  }

  const minutesLeft = closeMin - currentMinutes;
  if (minutesLeft <= 30) {
    return { status: 'closing', label: `CLOSES IN ${minutesLeft} MIN`, color: 'var(--solar)' };
  }

  return { status: 'open', label: 'OPEN', color: 'var(--aurora-3)' };
}

export const categoryColors: Record<BuildingCategory, string> = {
  academic: 'hsl(var(--aurora-1))',
  residential: 'hsl(var(--aurora-2))',
  facility: 'hsl(var(--solar))',
  recreation: 'hsl(var(--aurora-3))',
};

export const categoryLabels: Record<BuildingCategory, string> = {
  academic: 'Academic',
  residential: 'Residential',
  facility: 'Facility',
  recreation: 'Recreation',
};
