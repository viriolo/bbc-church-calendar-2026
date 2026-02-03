import { useState, useEffect, useMemo, useCallback } from 'react';
import Navigation from './sections/Navigation';
import HeroDashboard from './sections/HeroDashboard';
import QuarterFocus from './sections/QuarterFocus';
import EventsManagement from './sections/EventsManagement';
import CalendarGrid from './sections/CalendarGrid';
import Footer from './sections/Footer';
import LoginModal from './sections/LoginModal';
import EventFormModal from './sections/EventFormModal';
import { AdminProvider } from './lib/admin';
import type { Quarter, Event, Stats, CalendarView } from './types';
import { isAfter, isBefore, addDays, isSameMonth, isValid } from 'date-fns';
import {
  fetchEvents,
  fetchQuarters,
  fetchStats,
  type EventRow,
  type QuarterRow,
  type StatsRow,
} from './lib/api';

// ── Fallback data (used when API is unavailable) ──

const fallbackQuarters: Quarter[] = [
  {
    id: 1, name: 'Q1', theme: 'Witness Pathway', pathway: 'Witness',
    study: 'Book of Philippians', focus: 'Partnership in the Gospel', scripture: 'Acts 2:41',
    startDate: new Date(2026, 0, 1), endDate: new Date(2026, 2, 31),
    progress: 0, totalEvents: 0, confirmedEvents: 0, pendingEvents: 0,
    color: 'emerald', colorHex: '#E2EFDA',
  },
  {
    id: 2, name: 'Q2', theme: 'Bible Pathway', pathway: 'Bible',
    study: 'Expository Preaching', focus: 'Essence of God\'s Word', scripture: 'Acts 2:42',
    startDate: new Date(2026, 3, 1), endDate: new Date(2026, 5, 30),
    progress: 0, totalEvents: 0, confirmedEvents: 0, pendingEvents: 0,
    color: 'blue', colorHex: '#DDEBF7',
  },
  {
    id: 3, name: 'Q3', theme: 'Care Pathway', pathway: 'Care/Neighbour',
    study: 'Workshop (TBD)', focus: 'Body Ministry', scripture: 'Acts 2:44-46',
    startDate: new Date(2026, 6, 1), endDate: new Date(2026, 8, 30),
    progress: 0, totalEvents: 0, confirmedEvents: 0, pendingEvents: 0,
    color: 'amber', colorHex: '#FFF2CC',
  },
  {
    id: 4, name: 'Q4', theme: 'Freedom & Justice Pathway', pathway: 'Freedom & Justice',
    study: 'Workshop (TBD)', focus: 'Social Concern', scripture: 'Acts 2:47',
    startDate: new Date(2026, 9, 1), endDate: new Date(2026, 11, 31),
    progress: 0, totalEvents: 0, confirmedEvents: 0, pendingEvents: 0,
    color: 'orange', colorHex: '#FCE4D6',
  },
];

// ── Converters: DB row → frontend type ──

function safeDate(value: unknown): Date {
  if (!value) return new Date(2026, 0, 1); // fallback to Jan 1 2026

  const str = String(value);

  // If it's already an ISO timestamp, parse directly
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Try bare date with time component
  d = new Date(str + 'T00:00:00');
  if (!isNaN(d.getTime())) return d;

  // Try extracting just the date part (e.g. from "2026-01-05 and extra stuff")
  const match = str.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) {
    d = new Date(match[1] + 'T00:00:00');
    if (!isNaN(d.getTime())) return d;
  }

  // Absolute fallback — never return an invalid Date
  return new Date(2026, 0, 1);
}

function eventRowToEvent(row: EventRow): Event {
  return {
    id: String(row.id),
    title: row.title,
    date: safeDate(row.date),
    endDate: row.end_date ? safeDate(row.end_date) : undefined,
    status: row.status as Event['status'],
    ministry: row.ministry ?? undefined,
    description: row.description ?? undefined,
    budget: row.budget ?? undefined,
    sponsor: row.sponsor ?? undefined,
    category: row.category as Event['category'],
  };
}

function quarterRowToQuarter(row: QuarterRow): Quarter {
  return {
    id: row.id,
    name: row.name,
    theme: row.theme,
    pathway: row.pathway,
    study: row.study,
    focus: row.focus,
    scripture: row.scripture,
    startDate: safeDate(row.start_date),
    endDate: safeDate(row.end_date),
    progress: Number(row.progress),
    totalEvents: Number(row.total_events),
    confirmedEvents: Number(row.confirmed_events),
    pendingEvents: Number(row.pending_events),
    color: row.color,
    colorHex: row.color_hex,
  };
}

function statsRowToStats(row: StatsRow): Stats {
  return {
    totalEvents: Number(row.total_events),
    confirmedEvents: Number(row.confirmed_events),
    pendingEvents: Number(row.pending_events),
    needsAttention: Number(row.needs_attention),
    upcoming: Number(row.upcoming),
    ministries: Number(row.ministries),
    thisMonth: Number(row.this_month),
  };
}

// ── Helper: get quarter color for a month index (0-11) ──
export function getQuarterColorForMonth(monthIndex: number): { color: string; colorHex: string } {
  if (monthIndex <= 2) return { color: 'emerald', colorHex: '#E2EFDA' };
  if (monthIndex <= 5) return { color: 'blue', colorHex: '#DDEBF7' };
  if (monthIndex <= 8) return { color: 'amber', colorHex: '#FFF2CC' };
  return { color: 'orange', colorHex: '#FCE4D6' };
}

// ── Main App ──

function App() {
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date(2026, 1, 1),
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>(fallbackQuarters);
  const [apiStats, setApiStats] = useState<Stats | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Event form modal state
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [prefillDate, setPrefillDate] = useState('');

  const handleAddEvent = () => {
    setEditingEvent(null);
    setPrefillDate('');
    setEventFormOpen(true);
  };

  const handleAddEventOnDate = (date: Date) => {
    setEditingEvent(null);
    setPrefillDate(
      isValid(date)
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : ''
    );
    setEventFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setPrefillDate('');
    setEventFormOpen(true);
  };

  const handleEventFormClose = () => {
    setEventFormOpen(false);
    setEditingEvent(null);
    setPrefillDate('');
  };

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, quartersData, statsData] = await Promise.all([
        fetchEvents(),
        fetchQuarters(),
        fetchStats(),
      ]);

      console.log('[BBC Calendar] API responses:', {
        eventsCount: Array.isArray(eventsData) ? eventsData.length : 'not-array',
        quartersCount: Array.isArray(quartersData) ? quartersData.length : 'not-array',
        stats: statsData,
      });
      if (Array.isArray(eventsData) && eventsData.length > 0) {
        console.log('[BBC Calendar] Sample event row:', JSON.stringify(eventsData[0]));
      }

      // Convert events
      const convertedEvents: Event[] = [];
      if (Array.isArray(eventsData)) {
        for (const row of eventsData) {
          try {
            convertedEvents.push(eventRowToEvent(row));
          } catch (e) {
            console.warn('[BBC Calendar] Failed to convert event row:', row, e);
          }
        }
      }
      setEvents(convertedEvents);

      // Convert quarters
      if (Array.isArray(quartersData) && quartersData.length > 0) {
        try {
          setQuarters(quartersData.map(quarterRowToQuarter));
        } catch (e) {
          console.warn('[BBC Calendar] Failed to convert quarters:', e);
        }
      }

      // Convert stats
      if (statsData && typeof statsData === 'object') {
        try {
          const converted = statsRowToStats(statsData);
          console.log('[BBC Calendar] Converted stats:', converted);
          setApiStats(converted);
        } catch (e) {
          console.warn('[BBC Calendar] Failed to convert stats:', e);
        }
      }
    } catch (err) {
      console.warn('API unavailable, using local data:', err);
      setError('Could not connect to the database. Showing cached data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current quarter (by calendar date) and selected quarter for viewing
  const currentQuarterIndex = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    if (month <= 2) return 0;
    if (month <= 5) return 1;
    if (month <= 8) return 2;
    return 3;
  }, []);

  const currentQuarter = useMemo(
    () => quarters[currentQuarterIndex] || quarters[0],
    [quarters, currentQuarterIndex]
  );

  const [selectedQuarterIndex, setSelectedQuarterIndex] = useState(currentQuarterIndex);

  // Keep selected quarter in sync when quarters load (default to current quarter)
  useEffect(() => {
    setSelectedQuarterIndex((prev) => (quarters[prev] ? prev : currentQuarterIndex));
  }, [quarters, currentQuarterIndex]);

  // Compute stats from events (fallback when API stats aren't available)
  const stats: Stats = useMemo(() => {
    if (apiStats) return apiStats;
    const today = new Date();
    const confirmed = events.filter(e => e.status === 'confirmed').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const needsAttention = events.filter(e => e.status === 'draft' || e.status === 'needs-sponsor').length;
    const upcoming = events.filter(e => isAfter(e.date, today) && isBefore(e.date, addDays(today, 90))).length;
    const ministries = new Set(events.map(e => e.ministry).filter(Boolean)).size;
    const thisMonth = events.filter(e => isSameMonth(e.date, today)).length;
    return { totalEvents: events.length, confirmedEvents: confirmed, pendingEvents: pending, needsAttention, upcoming, ministries, thisMonth };
  }, [events, apiStats]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AdminProvider>
      <div className="min-h-screen sacred-bg">
        <Navigation isScrolled={isScrolled} calendarView={calendarView} setCalendarView={setCalendarView} />

        <main className="pt-20">
          {/* Error banner */}
          {error && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={loadData}
                  className="ml-4 px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <section id="hero-section">
            <HeroDashboard quarter={currentQuarter} stats={stats} />
          </section>

          <section id="events-section">
            <EventsManagement
              events={events}
              loading={loading}
              onEventsChanged={loadData}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
            />
          </section>

          <section id="calendar-section">
            <CalendarGrid
              events={events}
              onAddEventOnDate={handleAddEventOnDate}
              onEditEvent={handleEditEvent}
            />
          </section>

          <section id="quarter-section">
            <QuarterFocus
              quarters={quarters}
              selectedQuarterIndex={selectedQuarterIndex}
              onSelectQuarter={setSelectedQuarterIndex}
              currentQuarterIndex={currentQuarterIndex}
            />
          </section>
        </main>

        <Footer />

        {/* Modals */}
        <LoginModal />
        <EventFormModal
          isOpen={eventFormOpen}
          onClose={handleEventFormClose}
          onSaved={loadData}
          event={editingEvent}
          prefillDate={prefillDate}
        />
      </div>
    </AdminProvider>
  );
}

export default App;
