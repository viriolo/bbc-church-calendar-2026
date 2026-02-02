"use client";

import { useState, useEffect } from "react";
import { Calendar, List, Grid3X3, BarChart3, Plus, Menu, X, LogIn, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendarStore } from "@/store/calendar-store";
import { YearView } from "@/components/calendar/year-view";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { ListView } from "@/components/calendar/list-view";
import { EventDialog } from "@/components/calendar/event-dialog";
import { EventDetailDialog } from "@/components/calendar/event-detail-dialog";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Event, UserRole, QUARTERLY_PATHWAYS, getQuarterInfo } from "@/types";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export default function Home() {
  const [view, setView] = useState<"dashboard" | "year" | "month" | "week" | "list">("dashboard");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 2)); // Feb 2, 2026
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { events, ministries, currentUser, login, isLoading } = useCalendarStore();

  // Get current quarter info
  const quarterInfo = getQuarterInfo(currentDate);

  // Calculate stats
  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= new Date() && e.status !== 'cancelled')
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  const needsAttention = events.filter(
    e => e.status === 'draft' || (e.status === 'pending' && e.sponsorship_needed)
  ).length;

  const canEdit = currentUser && ['admin', 'ministry_leader', 'planning_committee'].includes(currentUser.role);

  const handleAddEvent = (date?: Date) => {
    setSelectedEvent(undefined);
    setSelectedDate(date);
    setIsEventDialogOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setIsEventDialogOpen(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login - in production this would authenticate with Supabase
    login('demo@bbc.com', 'password');
    setIsLoginDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight">BBC 2026 Calendar</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                "To Present Everyone Mature In Christ" (Colossians 1:28-29)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quarter indicator */}
            <Badge 
              className="hidden sm:flex"
              style={{ 
                backgroundColor: quarterInfo.bgColor, 
                color: quarterInfo.textColor,
                borderColor: quarterInfo.color
              }}
            >
              {quarterInfo.quarter}: {quarterInfo.name}
            </Badge>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">{currentUser.name}</span>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsLoginDialogOpen(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile quarter indicator */}
        <div className="sm:hidden px-4 pb-2">
          <Badge 
            className="text-xs"
            style={{ 
              backgroundColor: quarterInfo.bgColor, 
              color: quarterInfo.textColor
            }}
          >
            {quarterInfo.quarter}: {quarterInfo.name}
          </Badge>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform lg:translate-x-0 lg:static
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b lg:hidden">
              <h2 className="font-semibold">Navigation</h2>
            </div>
            
            <ScrollArea className="flex-1">
              <nav className="p-4 space-y-2">
                <Button
                  variant={view === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={view === 'year' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => { setView('year'); setMobileMenuOpen(false); }}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Year Overview
                </Button>
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => { setView('month'); setMobileMenuOpen(false); }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Monthly View
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => { setView('week'); setMobileMenuOpen(false); }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Weekly View
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => { setView('list'); setMobileMenuOpen(false); }}
                >
                  <List className="h-4 w-4 mr-2" />
                  List View
                </Button>
              </nav>

              {/* Quick Stats */}
              <div className="px-4 py-2 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Needs Attention</span>
                    <Badge variant={needsAttention > 0 ? 'destructive' : 'secondary'}>
                      {needsAttention}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Upcoming</span>
                    <Badge variant="secondary">{upcomingEvents.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ministries</span>
                    <Badge variant="secondary">{ministries.length}</Badge>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Add Event Button */}
            {canEdit && (
              <div className="p-4 border-t">
                <Button className="w-full" onClick={() => handleAddEvent()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* View Tabs - Mobile only */}
          <div className="lg:hidden p-4 border-b">
            <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="dashboard" className="px-2">
                  <BarChart3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="year" className="px-2">
                  <Grid3X3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="month" className="px-2">
                  <Calendar className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="week" className="px-2">
                  <Calendar className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* View Content */}
          <div className="p-4 lg:p-6">
            {view === 'dashboard' && (
              <Dashboard 
                events={events} 
                ministries={ministries}
                currentDate={currentDate}
                onEditEvent={handleViewEvent}
                onAddEvent={() => handleAddEvent()}
              />
            )}
            {view === 'year' && (
              <YearView 
                events={events}
                currentDate={currentDate}
                onDateSelect={(date) => {
                  setCurrentDate(date);
                  setView('month');
                }}
                onEventClick={handleViewEvent}
              />
            )}
            {view === 'month' && (
              <MonthView
                events={events}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onDateSelect={handleAddEvent}
                onEventClick={handleViewEvent}
              />
            )}
            {view === 'week' && (
              <WeekView
                events={events}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onEventClick={handleViewEvent}
              />
            )}
            {view === 'list' && (
              <ListView
                events={events}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onEventClick={handleViewEvent}
              />
            )}
          </div>
        </main>
      </div>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
        event={selectedEvent || null}
        onEdit={handleEditEvent}
        onClose={() => setIsEventDetailOpen(false)}
      />

      {/* Event Edit Dialog */}
      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        ministries={ministries}
        currentUser={currentUser}
      />

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsLoginDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Sign In</Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Demo: Use any email/password to sign in as admin
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
