/**
 * Google Calendar Sync Helper (lightweight — no googleapis dependency)
 *
 * Uses direct REST API calls + JWT auth via Node crypto.
 *
 * Requires these environment variables on Netlify:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account email
 *   GOOGLE_PRIVATE_KEY            — PEM private key
 *   GOOGLE_CALENDAR_ID            — the calendar to sync to
 */

import crypto from 'node:crypto';

interface CalendarEventData {
  title: string;
  date: string;        // yyyy-MM-dd
  endDate?: string;     // yyyy-MM-dd
  description?: string;
  status?: string;
  ministry?: string;
  category?: string;
}

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// --- JWT helpers ---

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) return null;

  const privateKey = rawKey.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const signInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = base64url(sign.sign(privateKey));

  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    console.error('[GCal] Token exchange failed:', res.status, await res.text());
    return null;
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// --- Event helpers ---

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
      date: data.date,
      timeZone: 'Pacific/Port_Moresby',
    },
    end: {
      date: data.endDate || data.date,
      timeZone: 'Pacific/Port_Moresby',
    },
  };
}

/**
 * Create a Google Calendar event. Returns the Google event ID, or null if not configured.
 */
export async function createGoogleCalendarEvent(data: CalendarEventData): Promise<string | null> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const token = await getAccessToken();
  if (!token || !calendarId) return null;

  try {
    const res = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildGoogleEvent(data)),
      }
    );

    if (!res.ok) {
      console.error('[GCal] Create failed:', res.status, await res.text());
      return null;
    }

    const result = await res.json() as { id: string };
    console.log('[GCal] Created event:', result.id);
    return result.id || null;
  } catch (err) {
    console.error('[GCal] Failed to create event:', err);
    return null;
  }
}

/**
 * Update an existing Google Calendar event.
 */
export async function updateGoogleCalendarEvent(googleEventId: string, data: CalendarEventData): Promise<boolean> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const token = await getAccessToken();
  if (!token || !calendarId) return false;

  try {
    const res = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildGoogleEvent(data)),
      }
    );

    if (!res.ok) {
      console.error('[GCal] Update failed:', res.status, await res.text());
      return false;
    }

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
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const token = await getAccessToken();
  if (!token || !calendarId) return false;

  try {
    const res = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok && res.status !== 410) { // 410 = already deleted
      console.error('[GCal] Delete failed:', res.status, await res.text());
      return false;
    }

    console.log('[GCal] Deleted event:', googleEventId);
    return true;
  } catch (err) {
    console.error('[GCal] Failed to delete event:', err);
    return false;
  }
}
