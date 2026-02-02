'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/sections/Navigation';
import HeroDashboard from '@/sections/HeroDashboard';
import QuarterFocus from '@/sections/QuarterFocus';
import EventsManagement from '@/sections/EventsManagement';
import CalendarGrid from '@/sections/CalendarGrid';
import BudgetOverview from '@/sections/BudgetOverview';
import Footer from '@/sections/Footer';
import { useCalendarStore } from '@/store/calendar-store';
import { startOfQuarter, endOfQuarter, format } from 'date-fns';
import type { QuarterInfo, Stats, CalendarView, DisplayEvent } from '@/types';

export default function Home() {
  const { events, ministries } = useCalendarStore();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date(2026, 1, 2),
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate stats from store data
  const stats: Stats = {
    needsAttention: events.filter(e => e.status === 'draft' || e.sponsorship_needed).length,
    upcoming: events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 5).length,
    ministries: ministries.length,
    totalEvents: events.length,
    confirmedEvents: events.filter(e => e.status === 'confirmed').length,
    pendingEvents: events.filter(e => e.status === 'pending').length,
  };

  // Current quarter info
  const currentDate = new Date(2026, 1, 2);
  const currentQuarter: QuarterInfo = {
    id: 1,
    name: 'Q1',
    theme: 'Witness Pathway',
    study: 'Book of Philippians',
    focus: 'Partnership in the Gospel',
    scripture: 'Acts 2:41',
    startDate: startOfQuarter(currentDate),
    endDate: endOfQuarter(currentDate),
    progress: Math.round((events.filter(e => e.quarter === 'Q1' && e.status === 'confirmed').length / 
      Math.max(events.filter(e => e.quarter === 'Q1').length, 1)) * 100),
    totalEvents: events.filter(e => e.quarter === 'Q1').length,
    confirmedEvents: events.filter(e => e.quarter === 'Q1' && e.status === 'confirmed').length,
    pendingEvents: events.filter(e => e.quarter === 'Q1' && e.status === 'pending').length,
  };

  // Convert store events to the format expected by new components
  const displayEvents: DisplayEvent[] = events
    .filter(e => new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 8)
    .map(e => ({
      id: e.id,
      title: e.title,
      date: new Date(e.event_date),
      status: (e.sponsorship_needed ? 'needs-sponsor' : e.status) as DisplayEvent['status'],
      ministry: e.ministry?.name || e.category,
      description: e.description || undefined,
      budget: e.budget_estimated || undefined,
    }));

  return (
    <div className="min-h-screen sacred-bg">
      <Navigation 
        isScrolled={isScrolled} 
        calendarView={calendarView} 
        setCalendarView={setCalendarView} 
      />
      
      <main className="pt-20">
        <HeroDashboard quarter={currentQuarter} stats={stats} />
        
        <QuarterFocus quarter={currentQuarter} />
        
        <EventsManagement events={displayEvents} />
        
        <CalendarGrid events={displayEvents} />
        
        <BudgetOverview />
      </main>
      
      <Footer />
    </div>
  );
}
