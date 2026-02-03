import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
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
  ChevronUp
} from 'lucide-react';
import type { Event } from '../types';
import { format } from 'date-fns';

interface EventsManagementProps {
  events: Event[];
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

export default function EventsManagement({ events }: EventsManagementProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All Events', count: events.length },
    { id: 'confirmed', label: 'Confirmed', count: events.filter(e => e.status === 'confirmed').length },
    { id: 'pending', label: 'Pending', count: events.filter(e => e.status === 'pending').length },
    { id: 'drafts', label: 'Drafts', count: events.filter(e => e.status === 'draft').length },
    { id: 'sponsorship', label: 'Sponsorship', count: events.filter(e => e.status === 'needs-sponsor').length },
  ];

  const filteredEvents = events
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
    .sort((a, b) => a.date.getTime() - b.date.getTime());

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
            <h2 className="text-3xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="mt-2 text-slate-600">View and track church events and activities</p>
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

        {/* Events List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => {
              const status = statusConfig[event.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedEvent === event.id;
              const needsUrgent = event.status === 'needs-sponsor';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer ${
                    isExpanded ? 'shadow-xl border-blue-300' : 'shadow-md hover:shadow-lg'
                  } ${needsUrgent ? 'border-l-4 border-l-rose-500' : ''}`}
                >
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Date */}
                      <div className="flex items-center gap-3 md:w-48">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {format(event.date, 'MMM d')}
                          </p>
                          <p className="text-sm text-slate-500">
                            {format(event.date, 'EEEE')}
                          </p>
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

                      {/* Status Badge + Expand Arrow */}
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.className}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && event.description && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50 border-t border-slate-100"
                      >
                        <div className="p-5">
                          <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>Date: {format(event.date, 'EEEE, MMMM d, yyyy')}</span>
                            {event.ministry && <span>Ministry: {event.ministry}</span>}
                            {event.category && <span className="capitalize">Category: {event.category}</span>}
                            {event.budget && <span>Budget: K{event.budget.toLocaleString()}</span>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No events found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
