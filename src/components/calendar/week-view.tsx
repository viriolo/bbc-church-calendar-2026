"use client";

import { useMemo } from "react";
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  startOfDay,
  addHours
} from "date-fns";

interface WeekViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
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

export function WeekView({ 
  events, 
  currentDate, 
  onDateChange, 
  onEventClick 
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(new Date(e.event_date), date));
  };

  const getEventPosition = (event: Event) => {
    if (!event.start_time) return { top: 0, height: 40 };
    
    const [hours, minutes] = event.start_time.split(':').map(Number);
    const startMinutes = (hours - 6) * 60 + minutes; // Offset from 6am
    const top = (startMinutes / 60) * 48; // 48px per hour
    
    // Default height if no end time
    let height = 48;
    if (event.end_time) {
      const [endHours, endMinutes] = event.end_time.split(':').map(Number);
      const durationMinutes = (endHours - hours) * 60 + (endMinutes - minutes);
      height = (durationMinutes / 60) * 48;
    }
    
    return { top, height: Math.max(height, 24) };
  };

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[250px] text-center">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
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

      {/* Week Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-3 border-r bg-muted" /> {/* Time column */}
              {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                return (
                  <div 
                    key={day.toISOString()}
                    className={`
                      p-3 text-center border-r last:border-r-0
                      ${isToday ? 'bg-primary/5' : 'bg-muted'}
                    `}
                  >
                    <div className={`
                      text-sm font-medium
                      ${isToday ? 'text-primary' : 'text-muted-foreground'}
                    `}>
                      {DAYS[day.getDay()]}
                    </div>
                    <div className={`
                      text-lg font-semibold
                      ${isToday ? 'text-primary' : ''}
                    `}>
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-8 relative" style={{ height: `${HOURS.length * 48}px` }}>
              {/* Time Labels */}
              <div className="border-r bg-muted">
                {HOURS.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-12 border-b px-2 text-xs text-muted-foreground flex items-center justify-end"
                  >
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, today);
                
                return (
                  <div 
                    key={day.toISOString()}
                    className={`
                      relative border-r last:border-r-0
                      ${isToday ? 'bg-primary/[0.02]' : ''}
                    `}
                  >
                    {/* Hour grid lines */}
                    {HOURS.map((hour) => (
                      <div 
                        key={hour}
                        className="h-12 border-b border-dashed border-muted"
                      />
                    ))}

                    {/* Events */}
                    {dayEvents.map((event) => {
                      const pos = getEventPosition(event);
                      return (
                        <div
                          key={event.id}
                          className="absolute left-0.5 right-0.5 rounded px-2 py-1 text-xs cursor-pointer hover:opacity-90 overflow-hidden"
                          style={{
                            top: `${pos.top}px`,
                            height: `${pos.height}px`,
                            backgroundColor: `${getCategoryColor(event.category)}20`,
                            borderLeft: `3px solid ${getCategoryColor(event.category)}`,
                            color: getCategoryColor(event.category)
                          }}
                          onClick={() => onEventClick(event)}
                          title={event.title}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {pos.height > 30 && event.start_time && (
                            <div className="text-[10px] opacity-80">
                              {event.start_time.slice(0, 5)}
                              {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                            </div>
                          )}
                          {pos.height > 45 && event.location && (
                            <div className="text-[10px] opacity-60 truncate">
                              {event.location}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
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
