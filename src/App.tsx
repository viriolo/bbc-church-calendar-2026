import { useState, useEffect, useMemo } from 'react';
import Navigation from './sections/Navigation';
import HeroDashboard from './sections/HeroDashboard';
import QuarterFocus from './sections/QuarterFocus';
import EventsManagement from './sections/EventsManagement';
import CalendarGrid from './sections/CalendarGrid';
import Footer from './sections/Footer';
import type { Quarter, Event, Stats, CalendarView } from './types';
import { isAfter, isBefore, addDays, isSameMonth } from 'date-fns';

// All four quarters per the BBC 2026 Quarterly Pathway System
const quarters: Quarter[] = [
  {
    id: 1,
    name: 'Q1',
    theme: 'Witness Pathway',
    pathway: 'Witness',
    study: 'Book of Philippians',
    focus: 'Partnership in the Gospel',
    scripture: 'Acts 2:41',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 2, 31),
    progress: 94,
    totalEvents: 0,
    confirmedEvents: 0,
    pendingEvents: 0,
    color: 'emerald',
    colorHex: '#E2EFDA',
  },
  {
    id: 2,
    name: 'Q2',
    theme: 'Bible Pathway',
    pathway: 'Bible',
    study: 'Expository Preaching',
    focus: 'Essence of God\'s Word',
    scripture: 'Acts 2:42',
    startDate: new Date(2026, 3, 1),
    endDate: new Date(2026, 5, 30),
    progress: 0,
    totalEvents: 0,
    confirmedEvents: 0,
    pendingEvents: 0,
    color: 'blue',
    colorHex: '#DDEBF7',
  },
  {
    id: 3,
    name: 'Q3',
    theme: 'Care Pathway',
    pathway: 'Care/Neighbour',
    study: 'Workshop (TBD)',
    focus: 'Body Ministry',
    scripture: 'Acts 2:44-46',
    startDate: new Date(2026, 6, 1),
    endDate: new Date(2026, 8, 30),
    progress: 0,
    totalEvents: 0,
    confirmedEvents: 0,
    pendingEvents: 0,
    color: 'amber',
    colorHex: '#FFF2CC',
  },
  {
    id: 4,
    name: 'Q4',
    theme: 'Freedom & Justice Pathway',
    pathway: 'Freedom & Justice',
    study: 'Workshop (TBD)',
    focus: 'Social Concern',
    scripture: 'Acts 2:47',
    startDate: new Date(2026, 9, 1),
    endDate: new Date(2026, 11, 31),
    progress: 0,
    totalEvents: 0,
    confirmedEvents: 0,
    pendingEvents: 0,
    color: 'orange',
    colorHex: '#FCE4D6',
  },
];

// BBC 2026 Events - key dates from the church planning document
const mockEvents: Event[] = [
  // ── Q1: WITNESS PATHWAY (Jan–Mar) ──
  // January
  { id: '1', title: 'New Year Prayer Service', date: new Date(2026, 0, 4), status: 'confirmed', ministry: 'Worship', description: 'New Year prayer and dedication service', category: 'worship' },
  { id: '2', title: 'Corporate Prayer Breakfast', date: new Date(2026, 0, 3), status: 'confirmed', ministry: 'Prayer', description: '1st Saturday corporate prayer breakfast', category: 'prayer' },
  { id: '3', title: 'Women Fellowship', date: new Date(2026, 0, 3), status: 'confirmed', ministry: 'Women', description: '1st Saturday women\'s fellowship gathering', category: 'fellowship' },
  { id: '4', title: 'Communion Service', date: new Date(2026, 0, 4), status: 'confirmed', ministry: 'Worship', description: '1st Sunday communion service', category: 'worship' },
  { id: '5', title: 'Mission Spot Sunday', date: new Date(2026, 0, 11), status: 'confirmed', ministry: 'Missions', description: '2nd Sunday mission spotlight', category: 'worship' },
  { id: '6', title: 'Youth Alive Fellowship', date: new Date(2026, 0, 16), status: 'confirmed', ministry: 'Youth', description: 'Friday youth fellowship', category: 'youth' },
  { id: '7', title: 'Planning Meeting', date: new Date(2026, 0, 24), status: 'confirmed', ministry: 'Admin', description: 'Year kickoff planning meeting', category: 'meetings' },
  { id: '8', title: 'Guest Speaker Sunday', date: new Date(2026, 0, 25), status: 'confirmed', ministry: 'Worship', description: '4th Sunday guest speaker', category: 'guest' },

  // February
  { id: '9', title: 'Combined Service / Communion', date: new Date(2026, 1, 1), status: 'confirmed', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '10', title: 'Friday Night Prayer & Breakfast', date: new Date(2026, 1, 6), status: 'confirmed', ministry: 'Prayer', description: '1st Friday night prayer and breakfast', category: 'prayer' },
  { id: '11', title: 'Corporate Prayer Breakfast', date: new Date(2026, 1, 7), status: 'confirmed', ministry: 'Prayer', description: '1st Saturday corporate prayer breakfast', category: 'prayer' },
  { id: '12', title: 'Women Fellowship', date: new Date(2026, 1, 7), status: 'confirmed', ministry: 'Women', description: '1st Saturday women\'s fellowship', category: 'fellowship' },
  { id: '13', title: 'Doulos Service', date: new Date(2026, 1, 8), status: 'confirmed', ministry: 'Worship', description: 'Doulos Service - Psalm 8:1 focus', category: 'special' },
  { id: '14', title: 'Pastor Break Begins', date: new Date(2026, 1, 9), status: 'confirmed', ministry: 'Admin', description: 'Pastor break period begins (Feb 9-20)', category: 'meetings' },
  { id: '15', title: 'Mission Spot Sunday', date: new Date(2026, 1, 8), status: 'confirmed', ministry: 'Missions', description: '2nd Sunday mission spotlight', category: 'worship' },
  { id: '16', title: 'YWAM Thomas Webber', date: new Date(2026, 1, 16), status: 'confirmed', ministry: 'Worship', description: 'Guest preacher - YWAM Thomas Webber during pastor break', category: 'guest' },
  { id: '17', title: 'Pastor Break Ends', date: new Date(2026, 1, 20), status: 'confirmed', ministry: 'Admin', description: 'Pastor break period ends', category: 'meetings' },
  { id: '18', title: 'KYB Workers Training', date: new Date(2026, 1, 21), status: 'confirmed', ministry: 'Training', description: '3rd week KYB workers training', category: 'training' },
  { id: '19', title: 'Church Board Meeting', date: new Date(2026, 1, 28), status: 'confirmed', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // March
  { id: '20', title: 'Combined Service / Communion', date: new Date(2026, 2, 1), status: 'confirmed', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '21', title: 'Corporate Prayer Breakfast', date: new Date(2026, 2, 7), status: 'confirmed', ministry: 'Prayer', description: '1st Saturday corporate prayer breakfast', category: 'prayer' },
  { id: '22', title: 'Women Fellowship', date: new Date(2026, 2, 7), status: 'confirmed', ministry: 'Women', description: '1st Saturday women\'s fellowship', category: 'fellowship' },
  { id: '23', title: 'KYB Workers Training', date: new Date(2026, 2, 21), status: 'confirmed', ministry: 'Training', description: '3rd week KYB workers training', category: 'training' },
  { id: '24', title: 'Church Board Meeting', date: new Date(2026, 2, 28), status: 'confirmed', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },
  { id: '25', title: 'Q1 Full Breakfast', date: new Date(2026, 2, 28), status: 'needs-sponsor', ministry: 'Fellowship', description: 'Quarter 1 full breakfast celebration - Partnership in the Gospel theme. Sponsorship needed.', budget: 800, category: 'fellowship' },

  // ── Q2: BIBLE PATHWAY (Apr–Jun) ──
  // April
  { id: '26', title: 'Passion Week - Day 1', date: new Date(2026, 3, 13), status: 'pending', ministry: 'Worship', description: 'Holy Week observance begins (dates TBC with Pastor)', category: 'special' },
  { id: '27', title: 'Passion Week - Day 2', date: new Date(2026, 3, 14), status: 'pending', ministry: 'Worship', description: 'Holy Week observance continues', category: 'special' },
  { id: '28', title: 'Passion Week - Day 3', date: new Date(2026, 3, 15), status: 'pending', ministry: 'Worship', description: 'Holy Week observance continues', category: 'special' },
  { id: '29', title: 'Passion Week - Day 4', date: new Date(2026, 3, 16), status: 'pending', ministry: 'Worship', description: 'Holy Week observance continues', category: 'special' },
  { id: '30', title: 'Good Friday Service', date: new Date(2026, 3, 17), status: 'pending', ministry: 'Worship', description: 'Good Friday service and reflection', budget: 300, category: 'special' },
  { id: '31', title: 'Easter Sunday', date: new Date(2026, 3, 20), status: 'confirmed', ministry: 'Worship', description: 'Resurrection Sunday celebration', budget: 2000, category: 'special' },
  { id: '32', title: 'Church Board Meeting', date: new Date(2026, 3, 25), status: 'pending', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // May
  { id: '33', title: 'Combined Service / Communion', date: new Date(2026, 4, 3), status: 'confirmed', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '34', title: 'Mother\'s Day Service', date: new Date(2026, 4, 10), status: 'confirmed', ministry: 'Worship', description: 'Special Mother\'s Day service', budget: 400, category: 'special' },
  { id: '35', title: 'Mission Spot Sunday', date: new Date(2026, 4, 10), status: 'confirmed', ministry: 'Missions', description: '2nd Sunday mission spotlight', category: 'worship' },
  { id: '36', title: 'Community Outreach', date: new Date(2026, 4, 16), status: 'confirmed', ministry: 'Evangelism', description: 'Community evangelism outreach', category: 'fellowship' },
  { id: '37', title: 'Church Board Meeting', date: new Date(2026, 4, 30), status: 'pending', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // June
  { id: '38', title: 'Combined Service / Communion', date: new Date(2026, 5, 7), status: 'draft', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '39', title: 'Father\'s Day Service', date: new Date(2026, 5, 21), status: 'draft', ministry: 'Worship', description: 'Special Father\'s Day service', budget: 400, category: 'special' },
  { id: '40', title: 'Q2 Full Breakfast', date: new Date(2026, 5, 27), status: 'needs-sponsor', ministry: 'Fellowship', description: 'Quarter 2 full breakfast celebration - Essence of God\'s Word theme. Sponsorship needed.', budget: 800, category: 'fellowship' },
  { id: '41', title: 'Church Board Meeting', date: new Date(2026, 5, 27), status: 'draft', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // ── Q3: CARE PATHWAY (Jul–Sep) ──
  // July
  { id: '42', title: 'Family Church Camp', date: new Date(2026, 6, 6), status: 'needs-sponsor', ministry: 'Fellowship', description: 'Annual family church camp during school holidays', budget: 5000, category: 'fellowship' },
  { id: '43', title: 'Independence Day Service', date: new Date(2026, 6, 5), status: 'draft', ministry: 'Worship', description: 'National day celebration service', category: 'worship' },
  { id: '44', title: 'Church Board Meeting', date: new Date(2026, 6, 25), status: 'draft', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // August
  { id: '45', title: 'Combined Service / Communion', date: new Date(2026, 7, 2), status: 'draft', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '46', title: 'VBS Week', date: new Date(2026, 7, 3), status: 'needs-sponsor', ministry: 'Education', description: 'Vacation Bible School', budget: 2500, category: 'training' },
  { id: '47', title: 'Church Board Meeting', date: new Date(2026, 7, 29), status: 'draft', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // September
  { id: '48', title: 'Church Anniversary', date: new Date(2026, 8, 13), status: 'pending', ministry: 'Admin', description: 'Church anniversary celebration', budget: 5000, category: 'special' },
  { id: '49', title: 'Q3 Full Breakfast', date: new Date(2026, 8, 26), status: 'needs-sponsor', ministry: 'Fellowship', description: 'Quarter 3 full breakfast celebration - Compassion & Care theme. Sponsorship needed.', budget: 800, category: 'fellowship' },
  { id: '50', title: 'Church Board Meeting', date: new Date(2026, 8, 26), status: 'draft', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // ── Q4: FREEDOM & JUSTICE PATHWAY (Oct–Dec) ──
  // October
  { id: '51', title: 'Combined Service / Communion', date: new Date(2026, 9, 4), status: 'draft', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '52', title: 'Harvest Festival', date: new Date(2026, 9, 18), status: 'pending', ministry: 'Hospitality', description: 'Annual harvest thanksgiving', budget: 2000, category: 'fellowship' },
  { id: '53', title: 'Church Board Meeting', date: new Date(2026, 9, 31), status: 'draft', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // November
  { id: '54', title: 'Combined Service / Communion', date: new Date(2026, 10, 1), status: 'draft', ministry: 'Worship', description: '1st Sunday combined service with communion', category: 'worship' },
  { id: '55', title: 'Church Board Meeting', date: new Date(2026, 10, 28), status: 'draft', ministry: 'Admin', description: '4th week church board meeting', category: 'meetings' },

  // December
  { id: '56', title: 'Christmas Concert', date: new Date(2026, 11, 20), status: 'draft', ministry: 'Worship', description: 'Annual Christmas concert', budget: 3000, category: 'special' },
  { id: '57', title: 'Christmas Day Service', date: new Date(2026, 11, 25), status: 'confirmed', ministry: 'Worship', description: 'Christmas Day worship service', budget: 1000, category: 'special' },
  { id: '58', title: 'Q4 Full Breakfast', date: new Date(2026, 11, 27), status: 'needs-sponsor', ministry: 'Fellowship', description: 'Quarter 4 full breakfast celebration - Freedom & Justice theme. Sponsorship needed.', budget: 800, category: 'fellowship' },
];

// Helper: get the quarter for a given date
function getQuarterForDate(date: Date): Quarter {
  const month = date.getMonth();
  if (month <= 2) return quarters[0];
  if (month <= 5) return quarters[1];
  if (month <= 8) return quarters[2];
  return quarters[3];
}

// Helper: get quarter color for a month index (0-11)
export function getQuarterColorForMonth(monthIndex: number): { color: string; colorHex: string } {
  if (monthIndex <= 2) return { color: 'emerald', colorHex: '#E2EFDA' };
  if (monthIndex <= 5) return { color: 'blue', colorHex: '#DDEBF7' };
  if (monthIndex <= 8) return { color: 'amber', colorHex: '#FFF2CC' };
  return { color: 'orange', colorHex: '#FCE4D6' };
}

function App() {
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date(2026, 1, 1),
  });
  const [events] = useState<Event[]>(mockEvents);
  const [isScrolled, setIsScrolled] = useState(false);

  // Determine current quarter
  const currentQuarter = useMemo(() => {
    const now = new Date();
    const q = getQuarterForDate(now);
    // Calculate dynamic stats for current quarter
    const qEvents = events.filter(e => e.date >= q.startDate && e.date <= q.endDate);
    const confirmed = qEvents.filter(e => e.status === 'confirmed').length;
    const pending = qEvents.filter(e => e.status === 'pending').length;
    const total = qEvents.length;
    const progress = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    return { ...q, totalEvents: total, confirmedEvents: confirmed, pendingEvents: pending, progress };
  }, [events]);

  // Derive stats from actual events data
  const stats: Stats = useMemo(() => {
    const today = new Date();
    const currentMonth = new Date();
    const confirmed = events.filter(e => e.status === 'confirmed').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const needsAttention = events.filter(e => e.status === 'draft' || e.status === 'needs-sponsor').length;
    const upcoming = events.filter(e => isAfter(e.date, today) && isBefore(e.date, addDays(today, 90))).length;
    const ministries = new Set(events.map(e => e.ministry).filter(Boolean)).size;
    const thisMonth = events.filter(e => isSameMonth(e.date, currentMonth)).length;

    return {
      totalEvents: events.length,
      confirmedEvents: confirmed,
      pendingEvents: pending,
      needsAttention,
      upcoming,
      ministries,
      thisMonth,
    };
  }, [events]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen sacred-bg">
      <Navigation isScrolled={isScrolled} calendarView={calendarView} setCalendarView={setCalendarView} />

      <main className="pt-20">
        <section id="hero-section">
          <HeroDashboard quarter={currentQuarter} stats={stats} />
        </section>

        <section id="events-section">
          <EventsManagement events={events} />
        </section>

        <section id="calendar-section">
          <CalendarGrid events={events} />
        </section>

        <section id="quarter-section">
          <QuarterFocus quarter={currentQuarter} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
