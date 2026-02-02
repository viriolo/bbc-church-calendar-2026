"use client";

import { useMemo } from "react";
import { Event } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QUARTERLY_PATHWAYS, getQuarterInfo } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";

interface YearViewProps {
  events: Event[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function MiniMonth({ 
  month, 
  year, 
  events,
  onDateSelect,
  onEventClick 
}: { 
  month: number; 
  year: number; 
  events: Event[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
}) {
  const quarterInfo = getQuarterInfo(new Date(year, month, 1));
  
  const monthDays = useMemo(() => {
    const start = startOfMonth(new Date(year, month, 1));
    const end = endOfMonth(start);
    const days = eachDayOfInterval({ start, end });
    
    // Pad with empty cells to align with correct day of week
    const startDay = getDay(start);
    const paddedDays: (Date | null)[] = Array(startDay).fill(null);
    paddedDays.push(...days);
    
    return paddedDays;
  }, [month, year]);

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(new Date(e.event_date), date));
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{MONTHS[month]}</CardTitle>
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              borderColor: quarterInfo.color,
              color: quarterInfo.textColor,
              backgroundColor: quarterInfo.bgColor
            }}
          >
            {quarterInfo.quarter}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {DAYS.map((day, i) => (
            <div key={i} className="text-[10px] text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
          {monthDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  aspect-square flex flex-col items-center justify-center text-[10px] rounded cursor-pointer
                  hover:bg-muted transition-colors relative
                  ${isToday ? 'bg-primary/10 font-bold text-primary' : ''}
                `}
                onClick={() => onDateSelect(day)}
              >
                {day.getDate()}
                {hasEvents && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div
                        key={idx}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: getCategoryColor(e.category) }}
                        title={e.title}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEventClick(e);
                        }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
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

export function YearView({ events, currentDate, onDateSelect, onEventClick }: YearViewProps) {
  const year = currentDate.getFullYear();
  
  return (
    <div className="space-y-6">
      {/* Year Header with Quarter Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(QUARTERLY_PATHWAYS).map(([q, info]) => (
          <div 
            key={q}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: info.bgColor }}
          >
            <Badge 
              style={{ backgroundColor: info.color, color: 'white' }}
            >
              {q}
            </Badge>
            <div className="text-sm">
              <span className="font-medium" style={{ color: info.textColor }}>
                {info.name}
              </span>
              <span className="text-muted-foreground text-xs ml-2">
                {info.focus}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 12 Month Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((_, monthIndex) => (
          <MiniMonth
            key={monthIndex}
            month={monthIndex}
            year={year}
            events={events}
            onDateSelect={onDateSelect}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
