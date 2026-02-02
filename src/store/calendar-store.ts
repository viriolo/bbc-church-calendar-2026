import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Event, 
  Ministry, 
  User, 
  UserRole, 
  EventStatus,
  Comment,
  ActivityLog,
  QuarterlyGoal,
  EVENT_TEMPLATES,
  getQuarterFromDate,
  getPathwayFromQuarter,
} from '@/types';
import { format, addWeeks, addMonths, getWeekOfMonth, getDay } from 'date-fns';

interface CalendarState {
  events: Event[];
  ministries: Ministry[];
  users: User[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  quarterlyGoals: QuarterlyGoal[];
  currentUser: User | null;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addComment: (eventId: string, content: string) => Promise<void>;
  addActivityLog: (eventId: string, action: string, oldValue?: object, newValue?: object) => Promise<void>;
  generateRecurringEvents: (parentEvent: Event, until: Date) => Promise<void>;
}

// Sample ministries
const defaultMinistries: Ministry[] = [
  { id: '1', name: 'Worship/Music Team', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Prayer Ministry', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Youth Alive', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Women Fellowship', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Men Fellowship', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'KYB Workers', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', name: 'Sunday School', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Evangelism/Outreach', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', name: 'Church Board', lead_person: 'Pastor', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '10', name: 'Scholarship Committee', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', name: 'YAGS (Young Adults)', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '12', name: 'Fellowship Team', lead_person: 'TBD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Generate sample events based on the planning document
const generateSampleEvents = (): Event[] => {
  const events: Event[] = [];
  const now = new Date().toISOString();

  // Helper to create an event
  const createEvent = (
    title: string,
    date: string,
    category: Event['category'],
    status: EventStatus,
    options: Partial<Event> = {}
  ): Event => {
    const eventDate = new Date(date);
    const quarter = getQuarterFromDate(eventDate);
    return {
      id: Math.random().toString(36).substring(2, 15),
      title,
      event_date: date,
      category,
      quarter,
      pathway: getPathwayFromQuarter(quarter),
      status,
      location: 'Boroko Baptist Church',
      sponsorship_needed: false,
      is_exception: false,
      created_by: 'system',
      created_at: now,
      updated_at: now,
      ...options,
    };
  };

  // Key 2026 dates from planning document
  events.push(createEvent('Church Planning Meeting', '2026-01-24', 'Planning', 'confirmed', {
    description: 'Annual church planning meeting',
    start_time: '09:00',
    end_time: '12:00',
  }));

  events.push(createEvent('Doulos Service', '2026-02-08', 'Special', 'confirmed', {
    description: 'Psalm 8:1 focus - Combined service',
    start_time: '09:00',
    end_time: '11:30',
    scripture: 'Psalm 8:1',
  }));

  events.push(createEvent('Pastor Break', '2026-02-09', 'Special', 'confirmed', {
    description: 'Pastor requesting time off - Feb 9-20',
    end_time: undefined,
  }));

  events.push(createEvent('YWAM Thomas Webber - Guest Speaker', '2026-02-16', 'Guest', 'confirmed', {
    description: 'YWAM Thomas Webber preaching during Pastor break',
    start_time: '09:00',
    end_time: '11:30',
    lead_person: 'Thomas Webber',
  }));

  events.push(createEvent('Q1 Full Breakfast', '2026-03-29', 'Fellowship', 'pending', {
    description: 'Partnership in the Gospel - Fully furnished breakfast',
    start_time: '08:00',
    end_time: '11:00',
    sponsorship_needed: true,
    budget_estimated: 500,
  }));

  events.push(createEvent('Palm Sunday', '2026-04-05', 'Worship', 'confirmed', {
    start_time: '09:00',
    end_time: '12:00',
  }));

  events.push(createEvent('Good Friday', '2026-04-10', 'Worship', 'confirmed', {
    start_time: '09:00',
    end_time: '12:00',
  }));

  events.push(createEvent('Easter Sunday', '2026-04-12', 'Worship', 'confirmed', {
    start_time: '09:00',
    end_time: '12:00',
  }));

  events.push(createEvent('Q2 Full Breakfast', '2026-06-28', 'Fellowship', 'pending', {
    description: 'Essence of God\'s Word - Fully furnished breakfast',
    start_time: '08:00',
    end_time: '11:00',
    sponsorship_needed: true,
    budget_estimated: 500,
  }));

  events.push(createEvent('Family Church Camp', '2026-07-18', 'Fellowship', 'draft', {
    description: 'First Family Church Family Camp - during school holidays',
    start_time: '14:00',
    end_time: '12:00',
    budget_estimated: 2000,
  }));

  events.push(createEvent('Q3 Full Breakfast', '2026-09-27', 'Fellowship', 'pending', {
    description: 'Compassion & Care - "When you need home"',
    start_time: '08:00',
    end_time: '11:00',
    sponsorship_needed: true,
    budget_estimated: 500,
  }));

  events.push(createEvent('Family Forum', '2026-10-20', 'Fellowship', 'draft', {
    description: 'Annual Family Forum event',
    start_time: '09:00',
    end_time: '12:00',
  }));

  events.push(createEvent('Christmas Day Service', '2026-12-25', 'Holiday', 'confirmed', {
    start_time: '09:00',
    end_time: '11:00',
  }));

  events.push(createEvent('Q4 Full Breakfast', '2026-12-26', 'Fellowship', 'pending', {
    description: 'Freedom & Justice - Fully furnished breakfast',
    start_time: '08:00',
    end_time: '11:00',
    sponsorship_needed: true,
    budget_estimated: 500,
  }));

  // Generate weekly recurring events for Feb 2026
  const generateWeeklyEvents = () => {
    const startDate = new Date(2026, 0, 4); // Jan 4, 2026 (Sunday)
    const endDate = new Date(2026, 11, 31); // Dec 31, 2026
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = format(d, 'yyyy-MM-dd');
      
      // Skip Pastor break period (Feb 9-20)
      if (d >= new Date(2026, 1, 9) && d <= new Date(2026, 1, 20)) continue;

      // Sunday Service
      if (dayOfWeek === 0) {
        events.push(createEvent('Sunday Service', dateStr, 'Worship', 'confirmed', {
          start_time: '09:00',
          end_time: '12:00',
          recurring_pattern: 'weekly_sunday',
        }));
      }
      
      // Wednesday Corporate Prayer
      if (dayOfWeek === 3) {
        events.push(createEvent('Corporate Prayer Meeting', dateStr, 'Prayer', 'confirmed', {
          start_time: '18:00',
          end_time: '19:00',
          recurring_pattern: 'weekly_wednesday',
        }));
      }
      
      // Thursday Music Jam
      if (dayOfWeek === 4) {
        events.push(createEvent('Music & Worship Jam', dateStr, 'Worship', 'confirmed', {
          start_time: '18:00',
          end_time: '21:00',
          recurring_pattern: 'weekly_thursday',
        }));
      }
      
      // Friday Youth Alive
      if (dayOfWeek === 5) {
        events.push(createEvent('Youth Alive Fellowship', dateStr, 'Youth', 'confirmed', {
          start_time: '18:00',
          end_time: '21:00',
          recurring_pattern: 'weekly_friday',
        }));
      }
    }
  };

  // Generate monthly recurring events
  const generateMonthlyEvents = () => {
    for (let month = 0; month < 12; month++) {
      // Skip Pastor break month adjustments for February
      const isFeb = month === 1;
      
      // First Friday - Friday Night Prayer
      const firstFriday = new Date(2026, month, 1);
      while (firstFriday.getDay() !== 5) firstFriday.setDate(firstFriday.getDate() + 1);
      if (!isFeb || firstFriday.getDate() < 9) {
        events.push(createEvent('Friday Night Prayer & Breakfast', format(firstFriday, 'yyyy-MM-dd'), 'Prayer', 'confirmed', {
          recurring_pattern: 'monthly_first_friday',
        }));
      }

      // First Saturday - Corporate Prayer Breakfast & Women Fellowship
      const firstSaturday = new Date(2026, month, 1);
      while (firstSaturday.getDay() !== 6) firstSaturday.setDate(firstSaturday.getDate() + 1);
      if (!isFeb || firstSaturday.getDate() < 9) {
        events.push(createEvent('Corporate Prayer Breakfast', format(firstSaturday, 'yyyy-MM-dd'), 'Prayer', 'confirmed', {
          start_time: '07:00',
          end_time: '09:00',
          recurring_pattern: 'monthly_first_saturday',
        }));
        
        events.push(createEvent('Women Fellowship', format(firstSaturday, 'yyyy-MM-dd'), 'Fellowship', 'confirmed', {
          start_time: '09:00',
          end_time: '11:00',
          recurring_pattern: 'monthly_first_saturday',
        }));
      }

      // First Sunday - Communion
      const firstSunday = new Date(2026, month, 1);
      while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1);
      if (!isFeb || firstSunday.getDate() < 9) {
        events.push(createEvent('Communion Sunday', format(firstSunday, 'yyyy-MM-dd'), 'Worship', 'confirmed', {
          start_time: '09:00',
          end_time: '12:00',
          recurring_pattern: 'monthly_first_sunday',
        }));
      }

      // Second Saturday - Men Fellowship
      const secondSaturday = new Date(2026, month, 8);
      while (secondSaturday.getDay() !== 6) secondSaturday.setDate(secondSaturday.getDate() + 1);
      if (!isFeb || secondSaturday.getDate() > 20) {
        events.push(createEvent('Men Fellowship', format(secondSaturday, 'yyyy-MM-dd'), 'Fellowship', 'confirmed', {
          start_time: '06:30',
          end_time: '08:00',
          recurring_pattern: 'monthly_second_saturday',
        }));
      }

      // Second Sunday - Mission Spot
      const secondSunday = new Date(2026, month, 8);
      while (secondSunday.getDay() !== 0) secondSunday.setDate(secondSunday.getDate() + 1);
      if (!isFeb || secondSunday.getDate() > 20) {
        events.push(createEvent('Mission Spot Sunday', format(secondSunday, 'yyyy-MM-dd'), 'Outreach', 'confirmed', {
          start_time: '09:00',
          end_time: '12:00',
          recurring_pattern: 'monthly_second_sunday',
        }));
      }

      // Third Wednesday - KYB Training
      const thirdWednesday = new Date(2026, month, 15);
      while (thirdWednesday.getDay() !== 3) thirdWednesday.setDate(thirdWednesday.getDate() + 1);
      if (!isFeb || thirdWednesday.getDate() > 20) {
        events.push(createEvent('KYB Workers Training', format(thirdWednesday, 'yyyy-MM-dd'), 'Training', 'confirmed', {
          recurring_pattern: 'monthly_third_wednesday',
        }));
      }

      // Fourth Saturday - Board Meeting
      const fourthSaturday = new Date(2026, month, 22);
      while (fourthSaturday.getDay() !== 6) fourthSaturday.setDate(fourthSaturday.getDate() + 1);
      if (!isFeb || fourthSaturday.getDate() > 20) {
        events.push(createEvent('Church Board Meeting', format(fourthSaturday, 'yyyy-MM-dd'), 'Board', 'confirmed', {
          start_time: '09:00',
          end_time: '11:00',
          recurring_pattern: 'monthly_fourth_saturday',
        }));
      }

      // Fourth Sunday - Guest Speaker
      const fourthSunday = new Date(2026, month, 22);
      while (fourthSunday.getDay() !== 0) fourthSunday.setDate(fourthSunday.getDate() + 1);
      if (!isFeb || fourthSunday.getDate() > 20) {
        events.push(createEvent('Guest Speaker Sunday', format(fourthSunday, 'yyyy-MM-dd'), 'Guest', 'pending', {
          start_time: '09:00',
          end_time: '12:00',
          recurring_pattern: 'monthly_fourth_sunday',
        }));
      }
    }
  };

  generateWeeklyEvents();
  generateMonthlyEvents();

  return events;
};

// Create the store
export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: generateSampleEvents(),
      ministries: defaultMinistries,
      users: [],
      comments: [],
      activityLogs: [],
      quarterlyGoals: [],
      currentUser: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        // Demo login - create a mock admin user
        const demoUser: User = {
          id: '1',
          email,
          name: 'Demas (Secretary)',
          phone: '+675 xxx xxxx',
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        set({ currentUser: demoUser });
      },

      logout: () => {
        set({ currentUser: null });
      },

      addEvent: async (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: Math.random().toString(36).substring(2, 15),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: async (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? { ...event, ...updates, updated_at: new Date().toISOString() }
              : event
          ),
        }));
      },

      deleteEvent: async (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      addComment: async (eventId, content) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        const newComment: Comment = {
          id: Math.random().toString(36).substring(2, 15),
          event_id: eventId,
          user_id: currentUser.id,
          content,
          created_at: new Date().toISOString(),
          resolved: false,
        };
        set((state) => ({
          comments: [...state.comments, newComment],
        }));
      },

      addActivityLog: async (eventId, action, oldValue, newValue) => {
        const { currentUser } = get();
        const newLog: ActivityLog = {
          id: Math.random().toString(36).substring(2, 15),
          event_id: eventId,
          user_id: currentUser?.id || 'system',
          action,
          old_value: oldValue || undefined,
          new_value: newValue || undefined,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          activityLogs: [...state.activityLogs, newLog],
        }));
      },

      generateRecurringEvents: async (parentEvent, until) => {
        // Implementation for generating recurring events
        console.log('Generate recurring events', parentEvent, until);
      },
    }),
    {
      name: 'bbc-calendar-storage',
      partialize: (state) => ({
        events: state.events,
        ministries: state.ministries,
        currentUser: state.currentUser,
      }),
    }
  )
);
