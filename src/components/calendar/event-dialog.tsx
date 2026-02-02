"use client";

import { useState, useEffect } from "react";
import { Event, Ministry, User, EventStatus, EventCategory, EVENT_TEMPLATES, getQuarterInfo, RecurringPattern } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarStore } from "@/store/calendar-store";
import { CalendarIcon, Trash2, Copy } from "lucide-react";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  selectedDate?: Date;
  ministries: Ministry[];
  currentUser: User | null;
}

const CATEGORIES: EventCategory[] = ['Worship', 'Prayer', 'Youth', 'Fellowship', 'Training', 'Leadership', 'Outreach', 'Special', 'Holiday', 'Guest', 'Planning', 'Board'];
const STATUSES: EventStatus[] = ['draft', 'pending', 'confirmed', 'completed', 'cancelled'];

export function EventDialog({ 
  open, 
  onOpenChange, 
  event, 
  selectedDate,
  ministries,
  currentUser 
}: EventDialogProps) {
  const isEditing = !!event;
  const { addEvent, updateEvent, deleteEvent } = useCalendarStore();
  
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    event_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    category: 'Worship',
    status: 'draft',
    location: 'Boroko Baptist Church',
    lead_person: '',
    ministry_id: undefined,
    budget_estimated: undefined,
    budget_approved: undefined,
    sponsorship_needed: false,
    scripture: '',
    recurring_pattern: 'none' as RecurringPattern,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date,
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        category: event.category,
        status: event.status,
        location: event.location,
        lead_person: event.lead_person || '',
        ministry_id: event.ministry_id,
        budget_estimated: event.budget_estimated,
        budget_approved: event.budget_approved,
        sponsorship_needed: event.sponsorship_needed,
        scripture: event.scripture || '',
        recurring_pattern: event.recurring_pattern || 'none',
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        event_date: format(selectedDate, 'yyyy-MM-dd'),
      }));
    }
  }, [event, selectedDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const date = new Date(formData.event_date!);
      const quarterInfo = getQuarterInfo(date);
      
      const eventData = {
        ...formData,
        quarter: quarterInfo.quarter,
        pathway: quarterInfo.pathway,
      } as Omit<Event, 'id' | 'created_at' | 'updated_at'>;

      if (isEditing && event) {
        await updateEvent(event.id, eventData);
      } else {
        await addEvent(eventData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(event.id);
      onOpenChange(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = EVENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.name,
        category: template.category,
        location: template.location,
        description: template.description || '',
        start_time: template.default_start_time || '',
        end_time: template.default_end_time || '',
        recurring_pattern: template.recurring_pattern || 'none',
      }));
    }
  };

  const quarterInfo = getQuarterInfo(new Date(formData.event_date || new Date()));
  const canEdit = currentUser && ['admin', 'ministry_leader', 'planning_committee'].includes(currentUser.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? 'Edit Event' : 'Add New Event'}
            {quarterInfo && (
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: quarterInfo.color,
                  color: quarterInfo.textColor,
                  backgroundColor: quarterInfo.bgColor
                }}
              >
                {quarterInfo.quarter}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Selector (only for new events) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
              disabled={!canEdit}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v as EventCategory })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v as EventStatus })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location & Lead Person */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event location"
                required
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_person">Lead Person</Label>
              <Input
                id="lead_person"
                value={formData.lead_person}
                onChange={(e) => setFormData({ ...formData, lead_person: e.target.value })}
                placeholder="Who is leading this event?"
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Ministry & Scripture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ministry">Responsible Ministry</Label>
              <Select 
                value={formData.ministry_id} 
                onValueChange={(v) => setFormData({ ...formData, ministry_id: v })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ministry..." />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map(ministry => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scripture">Scripture Reference</Label>
              <Input
                id="scripture"
                value={formData.scripture}
                onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                placeholder="e.g., John 3:16"
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description and details..."
              rows={3}
              disabled={!canEdit}
            />
          </div>

          {/* Budget Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Budget Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_estimated">Estimated Budget (K)</Label>
                <Input
                  id="budget_estimated"
                  type="number"
                  value={formData.budget_estimated || ''}
                  onChange={(e) => setFormData({ ...formData, budget_estimated: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0.00"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_approved">Approved Budget (K)</Label>
                <Input
                  id="budget_approved"
                  type="number"
                  value={formData.budget_approved || ''}
                  onChange={(e) => setFormData({ ...formData, budget_approved: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0.00"
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="sponsorship"
                    checked={formData.sponsorship_needed}
                    onCheckedChange={(v) => setFormData({ ...formData, sponsorship_needed: v })}
                    disabled={!canEdit}
                  />
                  <Label htmlFor="sponsorship" className="cursor-pointer">
                    Needs Sponsorship
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Pattern */}
          <div className="space-y-2">
            <Label htmlFor="recurring">Recurring Pattern</Label>
            <Select 
              value={formData.recurring_pattern} 
              onValueChange={(v) => setFormData({ ...formData, recurring_pattern: v as RecurringPattern })}
              disabled={!canEdit || isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Recurrence</SelectItem>
                <SelectItem value="weekly_sunday">Every Sunday</SelectItem>
                <SelectItem value="weekly_wednesday">Every Wednesday</SelectItem>
                <SelectItem value="weekly_thursday">Every Thursday</SelectItem>
                <SelectItem value="weekly_friday">Every Friday</SelectItem>
                <SelectItem value="monthly_first_friday">First Friday of Month</SelectItem>
                <SelectItem value="monthly_first_saturday">First Saturday of Month</SelectItem>
                <SelectItem value="monthly_first_sunday">First Sunday of Month</SelectItem>
                <SelectItem value="monthly_second_saturday">Second Saturday of Month</SelectItem>
                <SelectItem value="monthly_second_sunday">Second Sunday of Month</SelectItem>
                <SelectItem value="monthly_third_wednesday">Third Wednesday of Month</SelectItem>
                <SelectItem value="monthly_fourth_saturday">Fourth Saturday of Month</SelectItem>
                <SelectItem value="monthly_fourth_sunday">Fourth Sunday of Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            {isEditing && canEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {canEdit ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
