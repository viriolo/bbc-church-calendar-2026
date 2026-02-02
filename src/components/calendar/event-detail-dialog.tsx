"use client";

import { Event, Ministry, User, QUARTERLY_PATHWAYS, formatCurrency, getEventStatusColor, getEventStatusLabel } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCalendarStore } from "@/store/calendar-store";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  DollarSign, 
  AlertCircle,
  BookOpen,
  Target,
  FileText,
  Edit2,
  CheckCircle2,
  XCircle,
  Trash2,
  Download
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onClose: () => void;
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

export function EventDetailDialog({ open, onOpenChange, event, onEdit, onClose }: EventDetailDialogProps) {
  const { updateEvent, deleteEvent, currentUser } = useCalendarStore();
  
  if (!event) return null;

  const quarterInfo = QUARTERLY_PATHWAYS[event.quarter];
  const canEdit = currentUser && ['admin', 'ministry_leader', 'planning_committee'].includes(currentUser.role);

  const handleStatusChange = async (newStatus: Event['status']) => {
    await updateEvent(event.id, { status: newStatus });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(event.id);
      onOpenChange(false);
      onClose();
    }
  };

  const budgetRemaining = (event.budget_approved || 0) - (event.budget_actual || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{event.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: quarterInfo.color,
                    color: quarterInfo.textColor,
                    backgroundColor: quarterInfo.bgColor
                  }}
                >
                  {event.quarter}: {event.pathway}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getCategoryColor(event.category),
                    color: getCategoryColor(event.category)
                  }}
                >
                  {event.category}
                </Badge>
                <Badge variant={getStatusBadgeVariant(event.status)}>
                  {getEventStatusLabel(event.status)}
                </Badge>
                {event.sponsorship_needed && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs Sponsorship
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date & Time */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(parseISO(event.event_date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                
                {(event.start_time || event.end_time) && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {event.start_time && format(parseISO(`2000-01-01T${event.start_time}`), "h:mm a")}
                        {event.end_time && ` - ${format(parseISO(`2000-01-01T${event.end_time}`), "h:mm a")}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>

                {event.lead_person && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lead Person</p>
                      <p className="font-medium">{event.lead_person}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Quarter Focus */}
          <Card style={{ borderColor: quarterInfo.color }} className="border-l-4">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-3">{quarterInfo.name} Focus</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-xs">Study</span>
                    <span className="font-medium">{quarterInfo.book}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-xs">Focus</span>
                    <span className="font-medium">{quarterInfo.focus}</span>
                  </div>
                </div>
                {event.scripture && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-xs">Event Scripture</span>
                      <span className="font-medium">{event.scripture}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget Information */}
          {(event.budget_estimated || event.budget_approved || event.sponsorship_needed) && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Estimated</p>
                    <p className="text-lg font-semibold">{formatCurrency(event.budget_estimated)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="text-lg font-semibold">{formatCurrency(event.budget_approved)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Actual</p>
                    <p className="text-lg font-semibold">{formatCurrency(event.budget_actual)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className={`text-lg font-semibold ${budgetRemaining < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(budgetRemaining)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Event ID: {event.id}</p>
            <p>Created: {format(parseISO(event.created_at), "MMM d, yyyy h:mm a")}</p>
            {event.recurring_pattern && event.recurring_pattern !== 'none' && (
              <p>Recurring: {event.recurring_pattern.replace(/_/g, ' ')}</p>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <>
                <Button onClick={() => { onOpenChange(false); onEdit(event); }} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Event
                </Button>
                
                {event.status !== 'confirmed' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange('confirmed')}
                    className="gap-2 text-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Confirmed
                  </Button>
                )}
                
                {event.status !== 'cancelled' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange('cancelled')}
                    className="gap-2 text-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Event
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="gap-2 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className={!canEdit ? 'ml-auto' : ''}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
