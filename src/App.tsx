import { useState, useEffect, useMemo } from 'react';
import Navigation from './sections/Navigation';
import HeroDashboard from './sections/HeroDashboard';
import QuarterFocus from './sections/QuarterFocus';
import EventsManagement from './sections/EventsManagement';
import CalendarGrid from './sections/CalendarGrid';
import Footer from './sections/Footer';
import type { Quarter, Event, Stats, CalendarView } from './types';
import { endOfQuarter, startOfQuarter, isAfter, isBefore, addDays } from 'date-fns';

// Current Quarter
const currentQuarter: Quarter = {
  id: 1,
  name: 'Q1',
  theme: 'Witness Pathway',
  study: 'Book of Philippians',
  focus: 'Partnership in the Gospel',
  scripture: 'Acts 2:41',
  startDate: startOfQuarter(new Date(2026, 0, 1)),
  endDate: endOfQuarter(new Date(2026, 0, 1)),
  progress: 94,
  totalEvents: 71,
  confirmedEvents: 67,
  pendingEvents: 4,
};

// Events data - representative sample across 2026
const mockEvents: Event[] = [
  // January
  { id: '1', title: 'New Year Prayer Service', date: new Date(2026, 0, 4), status: 'confirmed', ministry: 'Worship', description: 'New Year prayer and dedication service' },
  { id: '2', title: 'Youth Bible Study', date: new Date(2026, 0, 10), status: 'confirmed', ministry: 'Youth', description: 'Weekly youth Bible study session' },
  { id: '3', title: 'Women\'s Fellowship', date: new Date(2026, 0, 17), status: 'confirmed', ministry: 'Women', description: 'Monthly women\'s fellowship gathering' },
  { id: '4', title: 'Church Board Meeting', date: new Date(2026, 0, 24), status: 'confirmed', ministry: 'Admin', description: 'Monthly board meeting' },
  // February
  { id: '5', title: 'Men\'s Breakfast', date: new Date(2026, 1, 7), status: 'confirmed', ministry: 'Men', description: 'Monthly men\'s breakfast fellowship' },
  { id: '6', title: 'Youth Camp Registration', date: new Date(2026, 1, 14), status: 'confirmed', ministry: 'Youth', description: 'Registration for annual youth camp' },
  { id: '7', title: 'Church Anniversary Planning', date: new Date(2026, 1, 15), status: 'pending', ministry: 'Admin', description: 'Planning committee meeting' },
  { id: '8', title: 'Praise Night', date: new Date(2026, 1, 21), status: 'confirmed', ministry: 'Worship', description: 'Evening of praise and worship' },
  { id: '9', title: 'Community Cleanup', date: new Date(2026, 1, 28), status: 'confirmed', ministry: 'Evangelism', description: 'Community service outreach' },
  // March
  { id: '10', title: 'Q1 Full Breakfast', date: new Date(2026, 2, 7), status: 'needs-sponsor', ministry: 'Hospitality', description: 'Quarterly fellowship breakfast', budget: 800 },
  { id: '11', title: 'Sunday School Workshop', date: new Date(2026, 2, 14), status: 'confirmed', ministry: 'Education', description: 'Teacher training workshop' },
  { id: '12', title: 'Choir Concert', date: new Date(2026, 2, 21), status: 'confirmed', ministry: 'Worship', description: 'Quarterly choir concert', budget: 500 },
  { id: '13', title: 'Q1 Review Meeting', date: new Date(2026, 2, 28), status: 'pending', ministry: 'Admin', description: 'Quarter 1 review and planning' },
  // April
  { id: '14', title: 'Passion Week - Day 1', date: new Date(2026, 3, 13), status: 'draft', ministry: 'Worship', description: 'Holy Week observance' },
  { id: '15', title: 'Good Friday Service', date: new Date(2026, 3, 17), status: 'confirmed', ministry: 'Worship', description: 'Good Friday service and reflection', budget: 300 },
  { id: '16', title: 'Easter Sunday', date: new Date(2026, 3, 20), status: 'confirmed', ministry: 'Worship', description: 'Resurrection Sunday celebration', budget: 2000 },
  { id: '17', title: 'Youth Camp Planning', date: new Date(2026, 3, 25), status: 'pending', ministry: 'Youth', description: 'Annual youth camp preparation meeting' },
  // May
  { id: '18', title: 'Community Outreach', date: new Date(2026, 4, 10), status: 'confirmed', ministry: 'Evangelism', description: 'Door-to-door evangelism' },
  { id: '19', title: 'Mother\'s Day Service', date: new Date(2026, 4, 11), status: 'confirmed', ministry: 'Worship', description: 'Special Mother\'s Day service', budget: 400 },
  { id: '20', title: 'Youth Camp', date: new Date(2026, 4, 22), status: 'needs-sponsor', ministry: 'Youth', description: 'Annual youth camp', budget: 3000 },
  // June
  { id: '21', title: 'Q2 Breakfast', date: new Date(2026, 5, 6), status: 'draft', ministry: 'Hospitality', description: 'Quarterly fellowship breakfast', budget: 800 },
  { id: '22', title: 'Father\'s Day Service', date: new Date(2026, 5, 21), status: 'confirmed', ministry: 'Worship', description: 'Special Father\'s Day service', budget: 400 },
  { id: '23', title: 'Missions Conference', date: new Date(2026, 5, 27), status: 'pending', ministry: 'Missions', description: 'Annual missions conference', budget: 1500 },
  // July-December (upcoming events)
  { id: '24', title: 'Independence Day Service', date: new Date(2026, 6, 5), status: 'draft', ministry: 'Worship', description: 'National day celebration service' },
  { id: '25', title: 'VBS Week', date: new Date(2026, 7, 3), status: 'needs-sponsor', ministry: 'Education', description: 'Vacation Bible School', budget: 2500 },
  { id: '26', title: 'Church Anniversary', date: new Date(2026, 8, 13), status: 'pending', ministry: 'Admin', description: 'Church anniversary celebration', budget: 5000 },
  { id: '27', title: 'Harvest Festival', date: new Date(2026, 9, 18), status: 'pending', ministry: 'Hospitality', description: 'Annual harvest thanksgiving', budget: 2000 },
  { id: '28', title: 'Christmas Concert', date: new Date(2026, 11, 20), status: 'draft', ministry: 'Worship', description: 'Annual Christmas concert', budget: 3000 },
  { id: '29', title: 'Christmas Day Service', date: new Date(2026, 11, 25), status: 'confirmed', ministry: 'Worship', description: 'Christmas Day worship service', budget: 1000 },
];

function App() {
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date(2026, 1, 1),
  });
  const [events] = useState<Event[]>(mockEvents);
  const [isScrolled, setIsScrolled] = useState(false);

  // Derive stats from actual events data
  const stats: Stats = useMemo(() => {
    const today = new Date();
    const confirmed = events.filter(e => e.status === 'confirmed').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const needsAttention = events.filter(e => e.status === 'draft' || e.status === 'needs-sponsor').length;
    const upcoming = events.filter(e => isAfter(e.date, today) && isBefore(e.date, addDays(today, 90))).length;
    const ministries = new Set(events.map(e => e.ministry).filter(Boolean)).size;

    return {
      totalEvents: events.length,
      confirmedEvents: confirmed,
      pendingEvents: pending,
      needsAttention,
      upcoming,
      ministries,
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
