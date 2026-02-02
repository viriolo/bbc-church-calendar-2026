import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
} from 'lucide-react';
import type { DisplayEvent } from '@/types';
import { 
  format, 
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

interface CalendarGridProps {
  events: DisplayEvent[];
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarGrid({ events }: CalendarGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1));
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
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
            <p className="mt-2 text-slate-600">View and manage church events</p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </motion.button>
            
            <div className="px-6 py-3 rounded-xl bg-white shadow-lg border border-slate-200">
              <span className="text-lg font-semibold text-slate-800">
                {format(currentMonth, 'MMMM yyyy')}
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
                  className={`
                    relative min-h-[100px] p-2 border-b border-r border-slate-100
                    transition-all duration-300 cursor-pointer day-cell
                    ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}
                    ${isTodayDate ? 'bg-blue-50/50' : ''}
                    ${isHovered ? 'bg-blue-50' : ''}
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
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Event Indicators */}
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`
                          text-xs px-2 py-1 rounded-md truncate font-medium
                          ${event.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${event.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${event.status === 'draft' ? 'bg-slate-100 text-slate-700' : ''}
                          ${event.status === 'needs-sponsor' ? 'bg-rose-100 text-rose-700' : ''}
                        `}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-500 px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Hover Effect */}
                  {isHovered && dayEvents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-blue-100/50 z-0"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

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

        {/* Year Overview - Mini Months */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">2026 Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {monthNames.map((month, index) => {
              const isCurrent = index === currentMonth.getMonth();
              return (
                <motion.div
                  key={month}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(new Date(2026, index, 1))}
                  className={`
                    cursor-pointer rounded-xl p-4 text-center transition-all duration-300
                    ${isCurrent 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-600/30' 
                      : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg'
                    }
                  `}
                >
                  <CalendarIcon className={`w-6 h-6 mx-auto mb-2 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                  <p className={`font-semibold ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                    {month.slice(0, 3)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
