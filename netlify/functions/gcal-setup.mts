import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';
import { createGoogleCalendarEvent } from './gcal.mts';

/**
 * POST /api/gcal-setup
 *
 * 1. Adds the google_calendar_event_id column if it doesn't exist
 * 2. Optionally syncs all existing events to Google Calendar (pass ?sync=true)
 */
export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return errorResponse('POST required', 405);
  }

  const sql = getDb();
  const url = new URL(req.url);
  const shouldSync = url.searchParams.get('sync') === 'true';

  try {
    // Step 1: Add column if not exists
    await sql`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255)
    `;

    const result: { migrated: boolean; synced: number; errors: number; message: string } = {
      migrated: true,
      synced: 0,
      errors: 0,
      message: 'Column google_calendar_event_id added (or already exists).',
    };

    // Step 2: Bulk sync existing events to Google Calendar
    if (shouldSync) {
      const events = await sql`
        SELECT * FROM events
        WHERE google_calendar_event_id IS NULL
        ORDER BY date ASC
      `;

      for (const event of events) {
        try {
          const gcalId = await createGoogleCalendarEvent({
            title: event.title,
            date: String(event.date).slice(0, 10),
            endDate: event.end_date ? String(event.end_date).slice(0, 10) : undefined,
            description: event.description,
            status: event.status,
            ministry: event.ministry,
            category: event.category,
          });

          if (gcalId) {
            await sql`
              UPDATE events SET google_calendar_event_id = ${gcalId} WHERE id = ${event.id}
            `;
            result.synced++;
          } else {
            result.errors++;
          }
        } catch (e) {
          console.error(`[GCal Setup] Failed to sync event ${event.id}:`, e);
          result.errors++;
        }
      }

      result.message += ` Synced ${result.synced} events to Google Calendar.`;
      if (result.errors > 0) {
        result.message += ` ${result.errors} events failed to sync.`;
      }
    }

    return jsonResponse(result);
  } catch (error) {
    console.error('GCal setup error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Setup failed',
      500
    );
  }
}
