"use client";

import { useMemo, useState } from "react";
import { Event, Ministry, getQuarterInfo, QUARTERLY_PATHWAYS, formatCurrency, Quarter, Pathway } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  AlertCircle, 
  Plus, 
  Download,
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  Filter,
  FileText,
  Printer
} from "lucide-react";
import { format, isSameMonth, isFuture, parseISO, isPast, isToday, startOfQuarter, endOfQuarter } from "date-fns";

interface DashboardProps {
  events: Event[];
  ministries: Ministry[];
  currentDate: Date;
  onEditEvent: (event: Event) => void;
  onAddEvent?: () => void;
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

function getQuarterColor(quarter: Quarter): { bg: string; text: string; border: string } {
  const colors: Record<Quarter, { bg: string; text: string; border: string }> = {
    Q1: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    Q2: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Q3: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    Q4: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  };
  return colors[quarter];
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

export function Dashboard({ events, ministries, currentDate, onEditEvent, onAddEvent }: DashboardProps) {
  const [attentionFilter, setAttentionFilter] = useState<'all' | 'draft' | 'sponsorship' | 'pending'>('all');
  const quarterInfo = getQuarterInfo(currentDate);
  
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const confirmedEvents = events.filter(e => e.status === 'confirmed').length;
    const pendingEvents = events.filter(e => e.status === 'pending').length;
    const draftEvents = events.filter(e => e.status === 'draft').length;
    const needsSponsorship = events.filter(e => e.sponsorship_needed).length;
    
    const totalBudget = events.reduce((sum, e) => sum + (e.budget_estimated || 0), 0);
    const approvedBudget = events.reduce((sum, e) => sum + (e.budget_approved || 0), 0);
    
    // Needs attention breakdown
    const needsAttentionEvents = events.filter(
      e => e.status === 'draft' || e.status === 'pending' || e.sponsorship_needed
    );
    
    const draftEventsList = events.filter(e => e.status === 'draft');
    const sponsorshipEventsList = events.filter(e => e.sponsorship_needed);
    const pendingEventsList = events.filter(e => e.status === 'pending');
    
    const upcomingEvents = events
      .filter(e => {
        const eventDate = parseISO(e.event_date);
        return (isFuture(eventDate) || isToday(eventDate)) && e.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 8);
      
    const thisMonthEvents = events.filter(e => isSameMonth(parseISO(e.event_date), currentDate));
    
    // Quarter progress
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    const quarterEvents = events.filter(e => {
      const d = parseISO(e.event_date);
      return d >= quarterStart && d <= quarterEnd;
    });
    const quarterConfirmed = quarterEvents.filter(e => e.status === 'confirmed').length;
    const quarterTotal = quarterEvents.length || 1;
    const quarterProgress = Math.round((quarterConfirmed / quarterTotal) * 100);
    
    return {
      totalEvents,
      confirmedEvents,
      pendingEvents,
      draftEvents,
      needsSponsorship,
      totalBudget,
      approvedBudget,
      needsAttentionEvents,
      draftEventsList,
      sponsorshipEventsList,
      pendingEventsList,
      upcomingEvents,
      thisMonthEvents,
      quarterProgress,
      quarterEvents,
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
      .slice(0, 6);
  }, [events]);

  // Filtered attention events
  const filteredAttentionEvents = useMemo(() => {
    switch (attentionFilter) {
      case 'draft': return stats.draftEventsList;
      case 'sponsorship': return stats.sponsorshipEventsList;
      case 'pending': return stats.pendingEventsList;
      default: return stats.needsAttentionEvents;
    }
  }, [attentionFilter, stats]);

  const quarterColors = getQuarterColor(quarterInfo.quarter);
  const qStart = startOfQuarter(currentDate);
  const qEnd = endOfQuarter(currentDate);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onAddEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Add Ministry
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Print View
        </Button>
      </div>

      {/* Enhanced Quarterly Pathway Card */}
      <Card className={`border-l-4 ${quarterColors.border}`} style={{ borderLeftColor: quarterInfo.color }}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Quarter Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{quarterInfo.name}</h2>
                <Badge 
                  className="text-sm px-3 py-1"
                  style={{ 
                    backgroundColor: quarterInfo.bgColor,
                    color: quarterInfo.textColor,
                    borderColor: quarterInfo.color
                  }}
                >
                  {quarterInfo.quarter}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-4">
                {format(qStart, "MMMM d")} - {format(qEnd, "MMMM d, yyyy")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className={`flex items-center gap-2 p-3 rounded-lg ${quarterColors.bg}`}>
                  <BookOpen className={`h-4 w-4 ${quarterColors.text}`} />
                  <div>
                    <span className="text-muted-foreground block text-xs">Study</span>
                    <span className="font-medium">{quarterInfo.book}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${quarterColors.bg}`}>
                  <Target className={`h-4 w-4 ${quarterColors.text}`} />
                  <div>
                    <span className="text-muted-foreground block text-xs">Focus</span>
                    <span className="font-medium">{quarterInfo.focus}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${quarterColors.bg}`}>
                  <FileText className={`h-4 w-4 ${quarterColors.text}`} />
                  <div>
                    <span className="text-muted-foreground block text-xs">Scripture</span>
                    <span className="font-medium">{quarterInfo.scripture}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Progress */}
            <div className="lg:w-64 space-y-3">
              <div className="text-sm text-muted-foreground">
                Quarter Progress
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${stats.quarterProgress}%`,
                      backgroundColor: quarterInfo.color
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {stats.quarterProgress}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.quarterEvents.filter(e => e.status === 'confirmed').length} of {stats.quarterEvents.length} events confirmed
              </div>
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
              {format(currentDate, "MMMM yyyy")}
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
              {stats.totalBudget > 0 && (
                <span className="ml-1">
                  ({Math.round((stats.approvedBudget / stats.totalBudget) * 100)}%)
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
            stats.needsAttentionEvents.length > 0 ? 'border-amber-300 bg-amber-50/50' : ''
          }`}
        >
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Needs Attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-2xl font-bold ${stats.needsAttentionEvents.length > 0 ? 'text-amber-600' : ''}`}>
              {stats.needsAttentionEvents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.needsSponsorship} need sponsorship, {stats.draftEvents} drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Needs Attention Detail */}
      {stats.needsAttentionEvents.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Events Needing Attention
              </CardTitle>
              <Tabs value={attentionFilter} onValueChange={(v) => setAttentionFilter(v as typeof attentionFilter)}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs">Drafts</TabsTrigger>
                  <TabsTrigger value="sponsorship" className="text-xs">Sponsorship</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredAttentionEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => onEditEvent(event)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    />
                    <span className="text-sm font-medium">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(event.event_date), "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.sponsorship_needed && (
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                        Needs Sponsor
                      </Badge>
                    )}
                    <Badge variant={getStatusBadgeVariant(event.status)} className="text-[10px]">
                      {event.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {filteredAttentionEvents.length > 5 && (
                <div className="text-center text-xs text-muted-foreground py-1">
                  +{filteredAttentionEvents.length - 5} more items
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                stats.upcomingEvents.map((event) => {
                  const isDraft = event.status === 'draft';
                  const needsSponsor = event.sponsorship_needed;
                  
                  return (
                    <div
                      key={event.id}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer
                        ${isDraft || needsSponsor ? 'border-amber-200 bg-amber-50/30' : 'hover:bg-muted/50'}
                      `}
                      onClick={() => onEditEvent(event)}
                    >
                      {/* Date Box with Quarter Color */}
                      <div 
                        className="flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center border-2"
                        style={{ 
                          backgroundColor: `${QUARTERLY_PATHWAYS[event.quarter].bgColor}`,
                          borderColor: QUARTERLY_PATHWAYS[event.quarter].color
                        }}
                      >
                        <span className="text-[10px] font-bold" style={{ color: QUARTERLY_PATHWAYS[event.quarter].textColor }}>
                          {event.quarter}
                        </span>
                        <span className="text-lg font-bold">
                          {format(parseISO(event.event_date), "d")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{event.title}</h4>
                              {isDraft && (
                                <Badge variant="outline" className="text-[10px]">Draft</Badge>
                              )}
                              {needsSponsor && (
                                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                  Sponsor Needed
                                </Badge>
                              )}
                            </div>
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
                              {event.lead_person && (
                                <span className="text-xs text-muted-foreground">
                                  • {event.lead_person}
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
                  );
                })
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
              <CardTitle className="text-sm">All Quarters Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Object.entries(QUARTERLY_PATHWAYS) as [Quarter, typeof QUARTERLY_PATHWAYS['Q1']][]).map(([q, info]) => {
                  const quarterEvents = events.filter(e => e.quarter === q);
                  const confirmed = quarterEvents.filter(e => e.status === 'confirmed').length;
                  const total = quarterEvents.length || 1;
                  const progress = Math.round((confirmed / total) * 100);
                  
                  return (
                    <div key={q}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{q}</span>
                        <span className="text-xs text-muted-foreground">
                          {confirmed}/{total}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
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
