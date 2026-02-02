"use client";

import { useMemo } from "react";
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  getDay
} from "date-fns";

interface MonthViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'confirmed': return 'default';
    case 'pending': return 'secondary';
    case 'draft': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

export function MonthView({ 
  events, 
  currentDate, 
  onDateChange, 
  onDateSelect,
  onEventClick 
}: MonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    return events
      .filter(e => isSameDay(new Date(e.event_date), date))
      .sort((a, b) => {
        // Sort by start time if available
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return a.title.localeCompare(b.title);
      });
  };

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
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

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted border-b">
          {DAYS.map((day) => (
            <div 
              key={day} 
              className="py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[100px] lg:min-h-[120px] p-2 border-b border-r
                  ${!isCurrentMonth ? 'bg-muted/50' : 'bg-card'}
                  ${isToday ? 'bg-primary/5' : ''}
                  hover:bg-muted/30 transition-colors cursor-pointer
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-primary text-primary-foreground' : ''}
                      ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80"
                      style={{ 
                        backgroundColor: `${getCategoryColor(event.category)}20`,
                        borderLeft: `3px solid ${getCategoryColor(event.category)}`,
                        color: getCategoryColor(event.category)
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      title={event.title}
                    >
                      {event.start_time && (
                        <span className="font-medium mr-1">
                          {event.start_time.slice(0, 5)}
                        </span>
                      )}
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div 
                      className="text-xs text-muted-foreground text-center py-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateSelect(day);
                      }}
                    >
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {['Worship', 'Prayer', 'Youth', 'Fellowship', 'Training', 'Outreach', 'Special'].map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getCategoryColor(cat) }}
            />
            <span className="text-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
