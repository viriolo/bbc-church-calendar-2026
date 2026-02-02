"use client";

import { useMemo, useState } from "react";
import { Event, EventCategory, EventStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  AlertCircle
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
  isSameDay
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Worship: '#8b5cf6',
    Prayer: '#22c55e',
    Youth: '#f59e0b',
    Fellowship: '#ec4899',
    Training: '#3b82f6',
    Leadership: '#6366f1',
    Outreach: '#f97316',
    Special: '#14b8a6',
    Holiday: '#ef4444',
    Guest: '#a855f7',
    Planning: '#64748b',
    Board: '#475569',
  };
  return colors[category] || '#6b7280';
}

function getStatusBadgeVariant(status: EventStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'confirmed': return 'default';
    case 'pending': return 'secondary';
    case 'draft': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

const CATEGORIES: EventCategory[] = ['Worship', 'Prayer', 'Youth', 'Fellowship', 'Training', 'Leadership', 'Outreach', 'Special', 'Holiday', 'Guest', 'Planning', 'Board'];
const STATUSES: EventStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];

export function ListView({ 
  events, 
  currentDate, 
  onDateChange, 
  onEventClick 
}: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        // Month filter
        const eventDate = parseISO(e.event_date);
        const inMonth = isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
        
        // Search filter
        const matchesSearch = searchQuery === '' || 
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category filter
        const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        
        return inMonth && matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        // Sort by date, then by start time
        const dateCompare = new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        if (dateCompare !== 0) return dateCompare;
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return 0;
      });
  }, [events, monthStart, monthEnd, searchQuery, categoryFilter, statusFilter]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    filteredEvents.forEach(event => {
      const dateKey = event.event_date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[150px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEvents.length} events
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => {
          const date = parseISO(dateKey);
          const isToday = isSameDay(date, today);
          
          return (
            <Card key={dateKey} className={isToday ? 'border-primary/50' : ''}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className={`
                    text-base font-semibold
                    ${isToday ? 'text-primary' : ''}
                  `}>
                    {format(date, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                  {isToday && (
                    <Badge variant="default" className="text-xs">Today</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {dateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onEventClick(event)}
                    >
                      {/* Time */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        {event.start_time ? (
                          <>
                            <span className="text-sm font-medium">
                              {format(parseISO(`2000-01-01T${event.start_time}`), "h:mm a")}
                            </span>
                            {event.end_time && (
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(`2000-01-01T${event.end_time}`), "h:mm a")}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">All Day</span>
                        )}
                      </div>

                      {/* Color indicator */}
                      <div 
                        className="w-1 self-stretch rounded-full"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium truncate">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: getCategoryColor(event.category), color: getCategoryColor(event.category) }}
                              >
                                {event.category}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                              {event.lead_person && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {event.lead_person}
                                </span>
                              )}
                              {event.sponsorship_needed && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <AlertCircle className="h-3 w-3" />
                                  Needs Sponsor
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No events found for this month</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or select a different month
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
