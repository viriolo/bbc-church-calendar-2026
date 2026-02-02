import { useState, useEffect } from 'react';
import Navigation from './sections/Navigation';
import HeroDashboard from './sections/HeroDashboard';
import QuarterFocus from './sections/QuarterFocus';
import EventsManagement from './sections/EventsManagement';
import CalendarGrid from './sections/CalendarGrid';
import EventsSummary from './sections/EventsSummary';
import Footer from './sections/Footer';
import type { Quarter, Event, Stats, CalendarView } from './types';
import { endOfQuarter, startOfQuarter } from 'date-fns';

// Mock Data
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

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Q1 Full Breakfast',
    date: new Date(2026, 2, 29),
    status: 'needs-sponsor',
    ministry: 'Hospitality',
    description: 'Quarterly fellowship breakfast',
    budget: 800,
  },
  {
    id: '2',
    title: 'Passion Week - Day 1',
    date: new Date(2026, 3, 13),
    status: 'draft',
    ministry: 'Worship',
    description: 'Holy Week observance',
  },
  {
    id: '3',
    title: 'Easter Sunday',
    date: new Date(2026, 3, 20),
    status: 'confirmed',
    ministry: 'Worship',
    description: 'Resurrection Sunday celebration',
    budget: 2000,
  },
  {
    id: '4',
    title: 'Youth Camp Planning',
    date: new Date(2026, 3, 25),
    status: 'pending',
    ministry: 'Youth',
    description: 'Annual youth camp preparation meeting',
  },
  {
    id: '5',
    title: 'Community Outreach',
    date: new Date(2026, 4, 10),
    status: 'confirmed',
    ministry: 'Evangelism',
    description: 'Door-to-door evangelism',
  },
];

const stats: Stats = {
  needsAttention: 9,
  upcoming: 5,
  ministries: 12,
  totalEvents: 322,
  confirmedEvents: 301,
  pendingEvents: 16,
};

function App() {
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date(2026, 1, 1),
  });
  const [events] = useState<Event[]>(mockEvents);
  const [isScrolled, setIsScrolled] = useState(false);

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
        
        <section id="quarter-section">
          <QuarterFocus quarter={currentQuarter} />
        </section>
        
        <section id="summary-section">
          <EventsSummary 
            totalEvents={stats.totalEvents}
            confirmedEvents={stats.confirmedEvents}
            pendingEvents={stats.pendingEvents}
            needsAttention={stats.needsAttention}
          />
        </section>
        
        <section id="events-section">
          <EventsManagement events={events} />
        </section>
        
        <section id="calendar-section">
          <CalendarGrid events={events} />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
