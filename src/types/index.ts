export interface Event {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  status: 'confirmed' | 'pending' | 'draft' | 'needs-sponsor';
  ministry?: string;
  description?: string;
  budget?: number;
  sponsor?: string;
  category?: 'worship' | 'prayer' | 'youth' | 'fellowship' | 'training' | 'meetings' | 'guest' | 'special';
}

export interface Ministry {
  id: string;
  name: string;
  leader: string;
  memberCount: number;
  color: string;
}

export interface Quarter {
  id: number;
  name: string;
  theme: string;
  pathway: string;
  study: string;
  focus: string;
  scripture: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  totalEvents: number;
  confirmedEvents: number;
  pendingEvents: number;
  color: string;
  colorHex: string;
}

export interface Budget {
  total: number;
  approved: number;
  pending: number;
  categories: {
    name: string;
    amount: number;
    color: string;
  }[];
}

export interface CalendarView {
  type: 'year' | 'month' | 'week' | 'list';
  currentDate: Date;
}

export interface Stats {
  needsAttention: number;
  upcoming: number;
  ministries: number;
  totalEvents: number;
  confirmedEvents: number;
  pendingEvents: number;
  thisMonth: number;
}
