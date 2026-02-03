import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Clock,
  Users,
  CheckCircle2,
  FileEdit,
  HeartHandshake,
  AlertCircle,
  Plus,
  Pencil,
  MessageSquare
} from 'lucide-react';
import type { Event } from '../types';
import { getQuarterColorForMonth } from '../App';
import { useAdmin } from '../lib/admin';
import {
  format,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';

function safeFormat(date: Date, fmt: string, fallback = '—'): string {
  try {
    return isValid(date) ? format(date, fmt) : fallback;
  } catch {
    return fallback;
  }
}

interface CalendarGridProps {
  events: Event[];
  onAddEventOnDate?: (date: Date) => void;
  onEditEvent?: (event: Event) => void;
  onViewEvent?: (event: Event) => void;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const quarterLabels: Record<number, string> = {
  0: 'Q1: Witness',
  1: 'Q1: Witness',
  2: 'Q1: Witness',
  3: 'Q2: Bible',
  4: 'Q2: Bible',
  5: 'Q2: Bible',
  6: 'Q3: Care',
  7: 'Q3: Care',
  8: 'Q3: Care',
  9: 'Q4: Freedom',
  10: 'Q4: Freedom',
  11: 'Q4: Freedom',
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-600' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600' },
  draft: { label: 'Draft', icon: FileEdit, color: 'text-slate-500' },
  'needs-sponsor': { label: 'Needs Sponsor', icon: HeartHandshake, color: 'text-rose-600' },
};

export default function CalendarGrid({ events, onAddEventOnDate, onEditEvent, onViewEvent }: CalendarGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1));
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { isAdmin } = useAdmin();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isValid(event.date) && isSameDay(event.date, day));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Get quarter color classes for the current month
  const currentMonthQuarter = getQuarterColorForMonth(currentMonth.getMonth());
  const quarterBorderColors: Record<string, string> = {
    emerald: 'border-emerald-300',
    blue: 'border-blue-300',
    amber: 'border-amber-300',
    orange: 'border-orange-300',
  };

  return (
    <section ref={ref} className="py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 sacred-bg" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Calendar</h2>
            <p className="mt-2 text-slate-600">
              {quarterLabels[currentMonth.getMonth()]} &middot; Click a day to see events
            </p>
          </div>

          {/* Month Navigation + Export */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </motion.button>

            <div className={`px-6 py-3 rounded-xl bg-white shadow-lg border ${quarterBorderColors[currentMonthQuarter.color] || 'border-slate-200'}`}>
              <span className="text-lg font-semibold text-slate-800">
                {safeFormat(currentMonth, 'MMMM yyyy')}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </motion.button>

            {isAdmin && (
              <motion.button
                type="button"
                aria-label="Export calendar as PDF"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.print()}
                className="export-pdf-btn hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg hover:bg-slate-800 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Export PDF</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`py-4 text-center text-sm font-semibold text-slate-600 ${
                  index === 0 || index === 6 ? 'text-rose-500' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const isHovered = hoveredDay && isSameDay(day, hoveredDay);
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, rotateX: -15 }}
                  animate={isInView ? { opacity: 1, rotateX: 0 } : {}}
                  transition={{
                    delay: 0.1 + index * 0.02,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => {
                    // If this is an empty day and the user is an admin,
                    // go straight to the "Add Event" flow for that date.
                    if (isAdmin && onAddEventOnDate && dayEvents.length === 0) {
                      onAddEventOnDate(day);
                      setSelectedDay(day);
                      return;
                    }

                    // Otherwise toggle the selected day panel to view events.
                    setSelectedDay(isSelected ? null : day);
                  }}
                  className={`
                    relative min-h-[100px] p-2 border-b border-r border-slate-100
                    transition-all duration-300 day-cell cursor-pointer
                    ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}
                    ${isTodayDate ? 'bg-blue-50/50' : ''}
                    ${isHovered ? 'bg-blue-50' : ''}
                    ${isSelected ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset' : ''}
                  `}
                >
                  {/* Day Number */}
                  <div className="flex justify-between items-start">
                    <span
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                        ${isTodayDate
                          ? 'bg-blue-600 text-white'
                          : isCurrentMonth
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      {safeFormat(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-slate-400 font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Indicators */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`
                          text-xs px-2 py-0.5 rounded-md truncate font-medium
                          ${event.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${event.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${event.status === 'draft' ? 'bg-slate-100 text-slate-700' : ''}
                          ${event.status === 'needs-sponsor' ? 'bg-rose-100 text-rose-700' : ''}
                        `}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-blue-600 px-2 font-medium">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Day Detail Panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-4 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {safeFormat(selectedDay, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isAdmin && onAddEventOnDate && (
                      <button
                        onClick={() => onAddEventOnDate(selectedDay)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Event
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map((event) => {
                      const status = statusConfig[event.status];
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={event.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onViewEvent?.(event)}
                          onKeyDown={(e) => e.key === 'Enter' && onViewEvent?.(event)}
                          className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors group/card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900 group-hover/card:text-blue-800 transition-colors">{event.title}</h4>
                              <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              {event.ministry && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Users className="w-3 h-3" />
                                  {event.ministry}
                                </span>
                              )}
                              {event.budget && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <AlertCircle className="w-3 h-3" />
                                  Budget: K{event.budget.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {onViewEvent && (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  View details & comments
                                </span>
                              )}
                              {isAdmin && onEditEvent && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onEditEvent(event); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No events on this day.
                    {isAdmin && onAddEventOnDate && ' Click "Add Event" to create one.'}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-4 justify-center"
        >
          {[
            { label: 'Confirmed', color: 'bg-emerald-500' },
            { label: 'Pending', color: 'bg-amber-500' },
            { label: 'Draft', color: 'bg-slate-400' },
            { label: 'Needs Sponsor', color: 'bg-rose-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Year Overview - Mini Months with Quarter Colors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">2026 Overview</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
            {monthNames.map((month, index) => {
              const isCurrent = index === currentMonth.getMonth();
              const quarterColor = getQuarterColorForMonth(index);
              const monthEventCount = events.filter(e => isValid(e.date) && e.date.getMonth() === index && e.date.getFullYear() === 2026).length;

              const bgClasses: Record<string, string> = {
                emerald: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
                blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
                amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
                orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
              };
              const activeBgClasses: Record<string, string> = {
                emerald: 'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-600/30',
                blue: 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-600/30',
                amber: 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/30',
                orange: 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-orange-500/30',
              };

              return (
                <motion.div
                  key={month}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(new Date(2026, index, 1))}
                  className={`
                    cursor-pointer rounded-xl p-3 text-center transition-all duration-300 border
                    ${isCurrent
                      ? `${activeBgClasses[quarterColor.color]} text-white shadow-lg`
                      : `${bgClasses[quarterColor.color]}`
                    }
                  `}
                >
                  <p className={`font-semibold text-sm ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                    {month.slice(0, 3)}
                  </p>
                  <p className={`text-xs mt-1 ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>
                    {monthEventCount} events
                  </p>
                </motion.div>
              );
            })}
          </div>
          {/* Quarter Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {[
              { label: 'Q1: Witness', color: 'bg-emerald-200' },
              { label: 'Q2: Bible', color: 'bg-blue-200' },
              { label: 'Q3: Care', color: 'bg-amber-200' },
              { label: 'Q4: Freedom', color: 'bg-orange-200' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
