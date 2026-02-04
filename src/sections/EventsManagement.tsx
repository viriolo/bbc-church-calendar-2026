import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  Filter,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  HeartHandshake,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  MessageSquare,
  History,
  ArrowRight
} from 'lucide-react';
import type { Event } from '../types';
import { format, isValid, isAfter, startOfDay, isSameMonth } from 'date-fns';
import { useAdmin } from '../lib/admin';

function safeFormat(date: Date, fmt: string, fallback = '—'): string {
  try {
    return isValid(date) ? format(date, fmt) : fallback;
  } catch {
    return fallback;
  }
}

interface EventsManagementProps {
  events: Event[];
  loading?: boolean;
  onEventsChanged?: () => void;
  onAddEvent?: () => void;
  onEditEvent?: (event: Event) => void;
  onViewEvent?: (event: Event) => void;
}

type FilterType = 'all' | 'drafts' | 'sponsorship' | 'pending' | 'confirmed';

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  confirmed: {
    label: 'Confirmed',
    className: 'status-confirmed',
    icon: CheckCircle2
  },
  pending: {
    label: 'Pending',
    className: 'status-pending animate-gentle-pulse',
    icon: Clock
  },
  draft: {
    label: 'Draft',
    className: 'status-draft',
    icon: FileEdit
  },
  'needs-sponsor': {
    label: 'Needs Sponsor',
    className: 'status-sponsor',
    icon: HeartHandshake
  },
};

function groupEventsByMonth(events: Event[]): { month: string; events: Event[] }[] {
  const groups: Map<string, Event[]> = new Map();

  for (const event of events) {
    const key = isValid(event.date)
      ? format(event.date, 'yyyy-MM')
      : '0000-00';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, events]) => ({
      month: events[0] && isValid(events[0].date)
        ? format(events[0].date, 'MMMM yyyy')
        : 'Unknown',
      events,
    }));
}

function getRelativeLabel(date: Date): string | null {
  if (!isValid(date)) return null;
  const today = startOfDay(new Date());
  const diff = Math.floor((startOfDay(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff > 7 && diff <= 14) return 'Next week';
  return null;
}

export default function EventsManagement({ events, loading, onAddEvent, onEditEvent, onViewEvent }: EventsManagementProps) {
  const { isAdmin } = useAdmin();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const upcoming: Event[] = [];
    const past: Event[] = [];
    for (const event of events) {
      if (isValid(event.date) && isAfter(startOfDay(event.date), today) || (isValid(event.date) && startOfDay(event.date).getTime() === today.getTime())) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    }
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events, today]);

  const baseEvents = showPast ? pastEvents : upcomingEvents;

  const filteredEvents = useMemo(() => {
    return baseEvents
      .filter(event => {
        const matchesFilter = activeFilter === 'all' ||
          (activeFilter === 'confirmed' && event.status === 'confirmed') ||
          (activeFilter === 'drafts' && event.status === 'draft') ||
          (activeFilter === 'sponsorship' && event.status === 'needs-sponsor') ||
          (activeFilter === 'pending' && event.status === 'pending');

        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.ministry?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => showPast
        ? b.date.getTime() - a.date.getTime()  // past: newest first
        : a.date.getTime() - b.date.getTime()   // upcoming: soonest first
      );
  }, [baseEvents, activeFilter, searchQuery, showPast]);

  const monthGroups = useMemo(() => groupEventsByMonth(filteredEvents), [filteredEvents]);

  const filterCounts = useMemo(() => ({
    all: baseEvents.length,
    confirmed: baseEvents.filter(e => e.status === 'confirmed').length,
    pending: baseEvents.filter(e => e.status === 'pending').length,
    drafts: baseEvents.filter(e => e.status === 'draft').length,
    sponsorship: baseEvents.filter(e => e.status === 'needs-sponsor').length,
  }), [baseEvents]);

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: filterCounts.all },
    { id: 'confirmed', label: 'Confirmed', count: filterCounts.confirmed },
    { id: 'pending', label: 'Pending', count: filterCounts.pending },
    { id: 'drafts', label: 'Drafts', count: filterCounts.drafts },
    { id: 'sponsorship', label: 'Sponsorship', count: filterCounts.sponsorship },
  ];

  return (
    <section ref={ref} className="py-12 bg-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-amber-100 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {showPast ? 'Past Events' : 'Upcoming Events'}
            </h2>
            <p className="mt-2 text-slate-600">
              {showPast
                ? `${pastEvents.length} events that have already taken place`
                : `${upcomingEvents.length} events coming up`
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Past/Upcoming Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowPast(!showPast); setActiveFilter('all'); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                showPast
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {showPast ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Show Upcoming
                </>
              ) : (
                <>
                  <History className="w-4 h-4" />
                  Past Events ({pastEvents.length})
                </>
              )}
            </motion.button>

            {isAdmin && onAddEvent && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddEvent}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Event
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? 'text-blue-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {activeFilter === filter.id && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-blue-100 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {filter.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {filter.count}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Events List — grouped by month */}
        <div className="space-y-6">
          {/* Loading skeleton */}
          {loading && events.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                    <div className="h-6 w-24 bg-slate-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {monthGroups.map((group, groupIndex) => (
            <div key={group.month}>
              {/* Month Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: groupIndex * 0.1 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-700 text-sm">{group.month}</span>
                  <span className="text-xs text-slate-400">({group.events.length})</span>
                </div>
                <div className="flex-1 h-px bg-slate-200" />
              </motion.div>

              {/* Events in this month */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {group.events.map((event, index) => {
                    const status = statusConfig[event.status] || statusConfig['draft'];
                    const StatusIcon = status.icon;
                    const isExpanded = expandedEvent === event.id;
                    const needsUrgent = event.status === 'needs-sponsor';
                    const showBadge = event.status !== 'confirmed';
                    const relativeLabel = !showPast ? getRelativeLabel(event.date) : null;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{
                          delay: (groupIndex * 0.1) + (index * 0.03),
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        onClick={() => {
                          if (onViewEvent) onViewEvent(event);
                          else setExpandedEvent(isExpanded ? null : event.id);
                        }}
                        className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer ${
                          isExpanded ? 'shadow-xl border-blue-300' : 'shadow-md hover:shadow-lg'
                        } ${needsUrgent ? 'border-l-4 border-l-rose-500' : ''}`}
                      >
                        <div className="p-5">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Date */}
                            <div className="flex items-center gap-3 md:w-48">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                                <div className="text-center">
                                  <p className="text-xs font-bold text-blue-600 leading-none">
                                    {safeFormat(event.date, 'MMM').toUpperCase()}
                                  </p>
                                  <p className="text-lg font-bold text-blue-700 leading-none">
                                    {safeFormat(event.date, 'd')}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {safeFormat(event.date, 'EEEE')}
                                </p>
                                {relativeLabel && (
                                  <p className="text-xs font-medium text-blue-600">
                                    {relativeLabel}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Event Info */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-800 transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                {event.ministry && (
                                  <span className="flex items-center gap-1 text-sm text-slate-500">
                                    <Users className="w-4 h-4" />
                                    {event.ministry}
                                  </span>
                                )}
                                {event.budget && (
                                  <span className="flex items-center gap-1 text-sm text-slate-500">
                                    <AlertCircle className="w-4 h-4" />
                                    Budget: K{event.budget.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status Badge (only for non-confirmed) + Actions */}
                            <div className="flex items-center gap-3">
                              {onViewEvent && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onViewEvent(event); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  View details
                                </button>
                              )}
                              {showBadge && (
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.className}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  {status.label}
                                </span>
                              )}
                              {!onViewEvent && (
                                <div className="text-slate-400">
                                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-slate-50 border-t border-slate-100"
                            >
                              <div className="p-5">
                                {event.description && (
                                  <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                  <span>Date: {safeFormat(event.date, 'EEEE, MMMM d, yyyy')}</span>
                                  {event.ministry && <span>Ministry: {event.ministry}</span>}
                                  {event.category && <span className="capitalize">Category: {event.category}</span>}
                                  {event.budget && <span>Budget: K{event.budget.toLocaleString()}</span>}
                                  <span className={`flex items-center gap-1 ${status.className}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                  </span>
                                </div>
                                {isAdmin && onEditEvent && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEditEvent(event); }}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Edit Event
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">
                {showPast ? 'No past events found' : 'No upcoming events found'}
              </h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
