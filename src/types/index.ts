// Enums
export type EventStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type UserRole = 'admin' | 'ministry_leader' | 'planning_committee' | 'member';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type Pathway = 'Witness' | 'Bible' | 'Care/Neighbour' | 'Freedom & Justice';
export type EventCategory = 
  | 'Worship' 
  | 'Prayer' 
  | 'Youth' 
  | 'Fellowship' 
  | 'Training' 
  | 'Leadership' 
  | 'Outreach' 
  | 'Special' 
  | 'Holiday' 
  | 'Guest' 
  | 'Planning'
  | 'Board';

export type RecurringPattern = 
  | 'weekly_sunday'
  | 'weekly_wednesday'
  | 'weekly_thursday'
  | 'weekly_friday'
  | 'monthly_first_friday'
  | 'monthly_first_saturday'
  | 'monthly_first_sunday'
  | 'monthly_second_saturday'
  | 'monthly_second_sunday'
  | 'monthly_third_wednesday'
  | 'monthly_fourth_saturday'
  | 'monthly_fourth_sunday'
  | 'none';

// Quarterly pathway info
export const QUARTERLY_PATHWAYS: Record<Quarter, {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  scripture: string;
  book: string;
  focus: string;
  months: number[];
}> = {
  Q1: {
    name: 'Witness Pathway',
    color: '#22c55e',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    scripture: 'Acts 2:41',
    book: 'Book of Philippians',
    focus: 'Partnership in the Gospel',
    months: [0, 1, 2], // Jan, Feb, Mar
  },
  Q2: {
    name: 'Bible Pathway',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    textColor: '#1d4ed8',
    scripture: 'Acts 2:42',
    book: 'Expository Preaching',
    focus: 'Essence of God\'s Word',
    months: [3, 4, 5], // Apr, May, Jun
  },
  Q3: {
    name: 'Care/Neighbour Pathway',
    color: '#eab308',
    bgColor: '#fef9c3',
    textColor: '#a16207',
    scripture: 'Acts 2:44-46',
    book: 'Body Ministry Workshop',
    focus: 'Body Ministry, Compassion & Care',
    months: [6, 7, 8], // Jul, Aug, Sep
  },
  Q4: {
    name: 'Freedom & Justice Pathway',
    color: '#f97316',
    bgColor: '#ffedd5',
    textColor: '#c2410c',
    scripture: 'Acts 2:47',
    book: 'Social Concern Workshop',
    focus: 'Social Concern & Justice',
    months: [9, 10, 11], // Oct, Nov, Dec
  },
};

// Database types
export interface Ministry {
  id: string;
  name: string;
  lead_person: string;
  lead_user_id?: string;
  meeting_day?: string;
  meeting_time?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  ministry_id?: string;
  ministry?: Ministry;
  created_at: string;
  last_sign_in_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  category: EventCategory;
  quarter: Quarter;
  pathway: Pathway;
  scripture?: string;
  status: EventStatus;
  lead_person?: string;
  ministry_id?: string;
  ministry?: Ministry;
  location: string;
  budget_estimated?: number;
  budget_approved?: number;
  budget_actual?: number;
  sponsorship_needed: boolean;
  confirmed_by?: string;
  confirmed_by_user?: User;
  created_by: string;
  created_by_user?: User;
  created_at: string;
  updated_at: string;
  recurring_pattern?: RecurringPattern;
  recurring_parent_id?: string;
  is_exception: boolean;
}

export interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  event_id: string;
  event?: Event;
  user_id: string;
  user?: User;
  action: string;
  old_value?: object;
  new_value?: object;
  created_at: string;
}

export interface QuarterlyGoal {
  id: string;
  ministry_id: string;
  ministry?: Ministry;
  year: number;
  quarter: Quarter;
  goals: string;
  status: 'active' | 'completed' | 'delayed';
  created_at: string;
  updated_at: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  category: EventCategory;
  default_start_time?: string;
  default_end_time?: string;
  default_duration?: number; // in minutes
  location: string;
  description?: string;
  recurring_pattern?: RecurringPattern;
}

// Pre-configured event templates
export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'sunday-service',
    name: 'Sunday Service',
    category: 'Worship',
    default_start_time: '09:00',
    default_end_time: '12:00',
    location: 'Boroko Baptist Church',
    description: 'Regular Sunday worship service',
    recurring_pattern: 'weekly_sunday',
  },
  {
    id: 'corporate-prayer',
    name: 'Corporate Prayer Meeting',
    category: 'Prayer',
    default_start_time: '18:00',
    default_end_time: '19:00',
    location: 'Boroko Baptist Church',
    description: 'Mid-week corporate prayer',
    recurring_pattern: 'weekly_wednesday',
  },
  {
    id: 'music-jam',
    name: 'Music & Worship Jam',
    category: 'Worship',
    default_start_time: '18:00',
    default_end_time: '21:00',
    location: 'Boroko Baptist Church',
    description: 'Music practice and worship preparation',
    recurring_pattern: 'weekly_thursday',
  },
  {
    id: 'youth-alive',
    name: 'Youth Alive Fellowship',
    category: 'Youth',
    default_start_time: '18:00',
    default_end_time: '21:00',
    location: 'Boroko Baptist Church',
    description: 'Youth fellowship and activities',
    recurring_pattern: 'weekly_friday',
  },
  {
    id: 'friday-night-prayer',
    name: 'Friday Night Prayer & Breakfast',
    category: 'Prayer',
    location: 'Boroko Baptist Church',
    description: 'Monthly Friday night prayer meeting',
    recurring_pattern: 'monthly_first_friday',
  },
  {
    id: 'corporate-prayer-breakfast',
    name: 'Corporate Prayer Breakfast',
    category: 'Prayer',
    default_start_time: '07:00',
    default_end_time: '09:00',
    location: 'Boroko Baptist Church',
    description: 'Saturday morning prayer breakfast',
    recurring_pattern: 'monthly_first_saturday',
  },
  {
    id: 'women-fellowship',
    name: 'Women Fellowship',
    category: 'Fellowship',
    default_start_time: '09:00',
    default_end_time: '11:00',
    location: 'Boroko Baptist Church',
    description: 'Monthly women\'s fellowship meeting',
    recurring_pattern: 'monthly_first_saturday',
  },
  {
    id: 'men-fellowship',
    name: 'Men Fellowship',
    category: 'Fellowship',
    default_start_time: '06:30',
    default_end_time: '08:00',
    location: 'Boroko Baptist Church',
    description: 'Monthly men\'s fellowship meeting',
    recurring_pattern: 'monthly_second_saturday',
  },
  {
    id: 'mission-spot',
    name: 'Mission Spot Sunday',
    category: 'Outreach',
    location: 'Boroko Baptist Church',
    description: 'Focus on missions and outreach',
    recurring_pattern: 'monthly_second_sunday',
  },
  {
    id: 'kyb-training',
    name: 'KYB Workers Training',
    category: 'Training',
    location: 'Boroko Baptist Church',
    description: 'Know Your Bible workers training',
    recurring_pattern: 'monthly_third_wednesday',
  },
  {
    id: 'board-meeting',
    name: 'Church Board Meeting',
    category: 'Board',
    default_start_time: '09:00',
    default_end_time: '11:00',
    location: 'Boroko Baptist Church',
    description: 'Monthly church board meeting',
    recurring_pattern: 'monthly_fourth_saturday',
  },
  {
    id: 'guest-speaker',
    name: 'Guest Speaker Sunday',
    category: 'Guest',
    location: 'Boroko Baptist Church',
    description: 'Guest speaker from other church/organization',
    recurring_pattern: 'monthly_fourth_sunday',
  },
  {
    id: 'yags',
    name: 'YAGS (Young Adults)',
    category: 'Fellowship',
    default_start_time: '18:00',
    default_end_time: '21:00',
    location: 'Boroko Baptist Church',
    description: 'Young adults fellowship group',
  },
  {
    id: 'women-kyb',
    name: 'Women KYB',
    category: 'Training',
    default_start_time: '09:00',
    default_end_time: '12:00',
    location: 'Boroko Baptist Church',
    description: 'Women\'s Know Your Bible study',
    recurring_pattern: 'weekly_wednesday',
  },
];

// Helper functions
export function getQuarterFromDate(date: Date): Quarter {
  const month = date.getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}

export function getPathwayFromQuarter(quarter: Quarter): Pathway {
  const map: Record<Quarter, Pathway> = {
    Q1: 'Witness',
    Q2: 'Bible',
    Q3: 'Care/Neighbour',
    Q4: 'Freedom & Justice',
  };
  return map[quarter];
}

export function getQuarterInfo(date: Date) {
  const quarter = getQuarterFromDate(date);
  const pathway = getPathwayFromQuarter(quarter);
  return { quarter, pathway, ...QUARTERLY_PATHWAYS[quarter] };
}

export function getEventStatusColor(status: EventStatus): string {
  const colors: Record<EventStatus, string> = {
    draft: '#6b7280', // gray-500
    pending: '#f59e0b', // amber-500
    confirmed: '#22c55e', // green-500
    completed: '#3b82f6', // blue-500
    cancelled: '#ef4444', // red-500
  };
  return colors[status];
}

export function getEventStatusLabel(status: EventStatus): string {
  const labels: Record<EventStatus, string> = {
    draft: 'Draft',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timeString?: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return 'K0.00';
  return `K${amount.toFixed(2)}`;
}
