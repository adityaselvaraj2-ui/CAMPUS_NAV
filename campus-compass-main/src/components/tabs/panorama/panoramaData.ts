export interface PanoramaLocation {
  id: string;
  name: string;
  icon: string;
  color: string;
  sublabel: string;
  description: string;
  tags: string[];
}

export const SJCE_LOCATIONS: PanoramaLocation[] = [
  {
    id: 'Auditorium',
    name: 'Auditorium',
    icon: '🎭',
    color: '#00D2FF',
    sublabel: 'Indoor Auditorium · Capacity 2000+',
    description: 'Main auditorium hosting convocations, national symposia, and cultural events.',
    tags: ['Indoor', 'Capacity 2000+', 'AC'],
  },
  {
    id: 'BasketBall_Court',
    name: 'Basketball Court',
    icon: '🏀',
    color: '#FF6B35',
    sublabel: 'Outdoor Court · Floodlit · 6AM–9PM',
    description: 'Full-size floodlit basketball court open for practice and tournaments.',
    tags: ['Outdoor', 'Floodlit', '6AM–9PM'],
  },
  {
    id: 'First_Year_Block',
    name: 'First Year Block',
    icon: '🎓',
    color: '#06D6A0',
    sublabel: 'Block 1·2·3 · 60+ Classrooms',
    description: 'First-year teaching complex with CSE, IT, and common labs.',
    tags: ['Block 1·2·3', '60+ Rooms', 'Labs'],
  },
  {
    id: 'Main_Entrance',
    name: 'Main Entrance',
    icon: '🚪',
    color: '#FFD166',
    sublabel: 'Innovation Centre · Exam Hall',
    description: 'Primary entrance gate off OMR Road, leading to the Innovation Centre.',
    tags: ['Gate', 'Innovation Centre', 'Exam Hall'],
  },
  {
    id: 'Mess_And_Canteen',
    name: 'Mess & Canteen',
    icon: '🍽️',
    color: '#EF476F',
    sublabel: 'Boys/Girls Mess · Open 7AM–10PM',
    description: 'Campus dining — Boys and Girls mess + main canteen serving 2000+ daily.',
    tags: ['Boys Mess', 'Girls Mess', '7AM–10PM'],
  },
  {
    id: 'Second_Year_Block',
    name: 'Second Year Block',
    icon: '🏛️',
    color: '#7B2FFF',
    sublabel: 'Block 4·12 · ECE · Bio Technology',
    description: 'Second year academic block for ECE, Biotech, and allied departments.',
    tags: ['Block 4·12', 'ECE', 'Bio Technology'],
  },
];

export const FEATURE_PILLS = [
  '📡 Gyroscope',
  '🖱️ Drag to Look',
  '🔍 Pinch/Scroll Zoom',
  '⚡ WebGL Rendered',
  '📴 Works Offline',
];
