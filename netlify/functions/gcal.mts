/**
 * Google Calendar Sync Helper
 *
 * Requires these environment variables on Netlify:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account email (e.g. bbc-calendar@proj.iam.gserviceaccount.com)
 *   GOOGLE_PRIVATE_KEY            — PEM private key (with literal \n replaced by actual newlines)
 *   GOOGLE_CALENDAR_ID            — the calendar to sync to (e.g. borokobaptistcurch@gmail.com)
 *
 * Setup steps:
 *   1. Create a Google Cloud project at console.cloud.google.com
 *   2. Enable the Google Calendar API
 *   3. Create a Service Account → download JSON key
 *   4. Share the Google Calendar with the service account email (give "Make changes to events" permission)
 *   5. Set the three env vars above on Netlify
 */

import { google } from 'googleapis';

interface CalendarEventData {
  title: string;
  date: string;        // yyyy-MM-dd
  endDate?: string;     // yyyy-MM-dd
  description?: string;
  status?: string;
  ministry?: string;
  category?: string;
}

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!email || !key || !calendarId) {
    return null; // Google Calendar not configured — sync silently skipped
  }

  // The private key comes from env as a string with literal \n — replace with real newlines
  const privateKey = key.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT(
    email,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/calendar'],
  );

  const calendar = google.calendar({ version: 'v3', auth });
  return { calendar, calendarId };
}

function buildGoogleEvent(data: CalendarEventData) {
  const statusPrefix = data.status && data.status !== 'confirmed'
    ? `[${data.status.toUpperCase()}] `
    : '';

  const descParts: string[] = [];
  if (data.description) descParts.push(data.description);
  if (data.ministry) descParts.push(`Ministry: ${data.ministry}`);
  if (data.category) descParts.push(`Category: ${data.category}`);
  descParts.push('— BBC 2026 Calendar');

  return {
    summary: `${statusPrefix}${data.title}`,
    description: descParts.join('\n'),
    start: {
      date: data.date,           // all-day event
      timeZone: 'Pacific/Port_Moresby',
    },
    end: {
      date: data.endDate || data.date,  // same day if no end date
      timeZone: 'Pacific/Port_Moresby',
    },
  };
}

/**
 * Create a Google Calendar event. Returns the Google event ID, or null if not configured.
 */
export async function createGoogleCalendarEvent(data: CalendarEventData): Promise<string | null> {
  const client = getCalendarClient();
  if (!client) return null;

  try {
    const res = await client.calendar.events.insert({
      calendarId: client.calendarId,
      requestBody: buildGoogleEvent(data),
    });
    console.log('[GCal] Created event:', res.data.id);
    return res.data.id || null;
  } catch (err) {
    console.error('[GCal] Failed to create event:', err);
    return null;
  }
}

/**
 * Update an existing Google Calendar event.
 */
export async function updateGoogleCalendarEvent(googleEventId: string, data: CalendarEventData): Promise<boolean> {
  const client = getCalendarClient();
  if (!client) return false;

  try {
    await client.calendar.events.update({
      calendarId: client.calendarId,
      eventId: googleEventId,
      requestBody: buildGoogleEvent(data),
    });
    console.log('[GCal] Updated event:', googleEventId);
    return true;
  } catch (err) {
    console.error('[GCal] Failed to update event:', err);
    return false;
  }
}

/**
 * Delete a Google Calendar event.
 */
export async function deleteGoogleCalendarEvent(googleEventId: string): Promise<boolean> {
  const client = getCalendarClient();
  if (!client) return false;

  try {
    await client.calendar.events.delete({
      calendarId: client.calendarId,
      eventId: googleEventId,
    });
    console.log('[GCal] Deleted event:', googleEventId);
    return true;
  } catch (err) {
    console.error('[GCal] Failed to delete event:', err);
    return false;
  }
}
