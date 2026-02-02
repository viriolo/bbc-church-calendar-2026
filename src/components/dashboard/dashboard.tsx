"use client";

import { useMemo } from "react";
import { Event, Ministry, getQuarterInfo, QUARTERLY_PATHWAYS, formatCurrency } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  AlertCircle, 
  TrendingUp,
  ChevronRight,
  BookOpen,
  Target,
  Clock
} from "lucide-react";
import { format, isSameMonth, isFuture, parseISO, isPast, isToday } from "date-fns";

interface DashboardProps {
  events: Event[];
  ministries: Ministry[];
  currentDate: Date;
  onEditEvent: (event: Event) => void;
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

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'confirmed': return 'default';
    case 'pending': return 'secondary';
    case 'draft': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

export function Dashboard({ events, ministries, currentDate, onEditEvent }: DashboardProps) {
  const quarterInfo = getQuarterInfo(currentDate);
  
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const confirmedEvents = events.filter(e => e.status === 'confirmed').length;
    const pendingEvents = events.filter(e => e.status === 'pending').length;
    const draftEvents = events.filter(e => e.status === 'draft').length;
    const needsSponsorship = events.filter(e => e.sponsorship_needed).length;
    
    const totalBudget = events.reduce((sum, e) => sum + (e.budget_estimated || 0), 0);
    const approvedBudget = events.reduce((sum, e) => sum + (e.budget_approved || 0), 0);
    
    const upcomingEvents = events
      .filter(e => {
        const eventDate = parseISO(e.event_date);
        return (isFuture(eventDate) || isToday(eventDate)) && e.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5);
      
    const thisMonthEvents = events.filter(e => isSameMonth(parseISO(e.event_date), currentDate));
    
    return {
      totalEvents,
      confirmedEvents,
      pendingEvents,
      draftEvents,
      needsSponsorship,
      totalBudget,
      approvedBudget,
      upcomingEvents,
      thisMonthEvents,
    };
  }, [events, currentDate]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Welcome & Quarter Focus */}
      <Card 
        className="border-l-4"
        style={{ borderLeftColor: quarterInfo.color }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{quarterInfo.name}</CardTitle>
              <CardDescription className="mt-1">
                {quarterInfo.focus}
              </CardDescription>
            </div>
            <Badge 
              className="text-sm px-3 py-1"
              style={{ 
                backgroundColor: quarterInfo.bgColor,
                color: quarterInfo.textColor,
                borderColor: quarterInfo.color
              }}
            >
              {quarterInfo.quarter} 2026
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Study:</span>
              <span className="font-medium">{quarterInfo.book}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Focus:</span>
              <span className="font-medium">{quarterInfo.focus}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Scripture:</span>
              <span className="font-medium">{quarterInfo.scripture}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Total Events</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-[10px]">{stats.confirmedEvents} confirmed</Badge>
              <Badge variant="secondary" className="text-[10px]">{stats.pendingEvents} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">This Month</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.thisMonthEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              events scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Budget Overview</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.approvedBudget)} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Needs Attention</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-600">
              {stats.needsSponsorship + stats.draftEvents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.needsSponsorship} need sponsorship, {stats.draftEvents} drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingEvents.length > 0 ? (
                stats.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onEditEvent(event)}
                  >
                    {/* Date Box */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex flex-col items-center justify-center">
                      <span className="text-xs text-muted-foreground uppercase">
                        {format(parseISO(event.event_date), "MMM")}
                      </span>
                      <span className="text-lg font-bold">
                        {format(parseISO(event.event_date), "d")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className="text-[10px]"
                              style={{ 
                                borderColor: getCategoryColor(event.category),
                                color: getCategoryColor(event.category)
                              }}
                            >
                              {event.category}
                            </Badge>
                            {event.start_time && (
                              <span className="text-xs text-muted-foreground">
                                {event.start_time.slice(0, 5)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(event.status)} className="text-xs">
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming events
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Events by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryStats.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(category) }}
                      />
                      <span className="text-sm">{category}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quarter Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(QUARTERLY_PATHWAYS).map(([q, info]) => {
                  const isCurrent = q === quarterInfo.quarter;
                  const quarterEvents = events.filter(e => e.quarter === q);
                  const confirmed = quarterEvents.filter(e => e.status === 'confirmed').length;
                  const total = quarterEvents.length || 1;
                  const progress = Math.round((confirmed / total) * 100);
                  
                  return (
                    <div key={q} className={isCurrent ? 'opacity-100' : 'opacity-60'}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{q}</span>
                        <span className="text-xs text-muted-foreground">
                          {confirmed}/{total} confirmed
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded-full bg-muted overflow-hidden"
                      >
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: info.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ministry Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ministries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ministries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active ministries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
