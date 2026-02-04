import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from './gcal.mts';

export default async function handler(req: Request, _context: Context) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const sql = getDb();
  const url = new URL(req.url);

  try {
    // GET /api/events — list all events
    if (req.method === 'GET') {
      const status = url.searchParams.get('status');
      const ministry = url.searchParams.get('ministry');
      const month = url.searchParams.get('month'); // format: 2026-02
      const search = url.searchParams.get('search');

      let events;

      if (status && status !== 'all') {
        events = await sql`
          SELECT * FROM events WHERE status = ${status} ORDER BY date ASC
        `;
      } else if (ministry) {
        events = await sql`
          SELECT * FROM events WHERE ministry = ${ministry} ORDER BY date ASC
        `;
      } else if (month) {
        events = await sql`
          SELECT * FROM events
          WHERE to_char(date, 'YYYY-MM') = ${month}
          ORDER BY date ASC
        `;
      } else if (search) {
        const searchTerm = `%${search}%`;
        events = await sql`
          SELECT * FROM events
          WHERE title ILIKE ${searchTerm} OR ministry ILIKE ${searchTerm}
          ORDER BY date ASC
        `;
      } else {
        events = await sql`SELECT * FROM events ORDER BY date ASC`;
      }

      return jsonResponse(events);
    }

    // POST /api/events — create a new event
    if (req.method === 'POST') {
      const body = await req.json();
      const { title, date, end_date, status, ministry, description, budget, sponsor, category, actor } = body;
      const who = actor || 'Admin';

      if (!title || !date) {
        return errorResponse('title and date are required', 400);
      }

      const result = await sql`
        INSERT INTO events (title, date, end_date, status, ministry, description, budget, sponsor, category)
        VALUES (
          ${title},
          ${date},
          ${end_date || null},
          ${status || 'draft'},
          ${ministry || null},
          ${description || null},
          ${budget || null},
          ${sponsor || null},
          ${category || null}
        )
        RETURNING *
      `;
      const event = result[0];

      // Activity log (non-blocking — don't fail if table doesn't exist yet)
      try {
        await sql`
          INSERT INTO event_activity_log (event_id, actor, action, summary)
          VALUES (${event.id}, ${who}, 'created', ${`Event '${String(title).replace(/'/g, "''")}' created`})
        `;
      } catch (e) { console.error('[Activity Log] create:', e); }

      // Sync to Google Calendar (non-blocking — don't fail the API call if GCal fails)
      const gcalId = await createGoogleCalendarEvent({
        title,
        date,
        endDate: end_date,
        description,
        status: status || 'draft',
        ministry,
        category,
      });

      if (gcalId) {
        await sql`UPDATE events SET google_calendar_event_id = ${gcalId} WHERE id = ${event.id}`;
        event.google_calendar_event_id = gcalId;
      }

      return jsonResponse(event, 201);
    }

    // PUT /api/events?id=X — update an event
    if (req.method === 'PUT') {
      const id = url.searchParams.get('id');
      if (!id) {
        return errorResponse('id query parameter is required', 400);
      }

      const body = await req.json();
      const { title, date, end_date, status, ministry, description, budget, sponsor, category, actor } = body;
      const who = actor || 'Admin';

      const existing = await sql`SELECT * FROM events WHERE id = ${id}`;
      if (existing.length === 0) {
        return errorResponse('Event not found', 404);
      }
      const old = existing[0];

      const result = await sql`
        UPDATE events SET
          title = COALESCE(${title ?? null}, title),
          date = COALESCE(${date ?? null}, date),
          end_date = ${end_date !== undefined ? end_date : old.end_date},
          status = COALESCE(${status ?? null}, status),
          ministry = COALESCE(${ministry ?? null}, ministry),
          description = COALESCE(${description ?? null}, description),
          budget = ${budget !== undefined ? budget : old.budget},
          sponsor = ${sponsor !== undefined ? sponsor : old.sponsor},
          category = COALESCE(${category ?? null}, category),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      const event = result[0];

      // Activity log
      const summaries: string[] = [];
      if (status != null && String(old.status) !== String(status)) {
        summaries.push(`status changed from ${old.status} to ${status}`);
      }
      if (title != null && String(old.title) !== String(title)) {
        summaries.push(`title updated to '${String(title).replace(/'/g, "''")}'`);
      }
      if (date != null && String(old.date) !== String(date)) {
        summaries.push(`date changed to ${date}`);
      }
      if (ministry !== undefined && String(old.ministry ?? '') !== String(ministry ?? '')) {
        summaries.push(`ministry updated`);
      }
      if (description !== undefined && String(old.description ?? '') !== String(description ?? '')) {
        summaries.push(`description updated`);
      }
      if (budget !== undefined && Number(old.budget) !== Number(budget)) {
        summaries.push(`budget updated`);
      }
      if (summaries.length > 0) {
        try {
          const action = summaries.some((s) => s.startsWith('status changed')) ? 'status_changed' : 'updated';
          const summary = `Event '${String(event.title).replace(/'/g, "''")}' — ${summaries.join('; ')}`;
          await sql`
            INSERT INTO event_activity_log (event_id, actor, action, summary)
            VALUES (${event.id}, ${who}, ${action}, ${summary})
          `;
        } catch (e) { console.error('[Activity Log] update:', e); }
      }

      // Sync to Google Calendar
      if (event.google_calendar_event_id) {
        await updateGoogleCalendarEvent(event.google_calendar_event_id, {
          title: event.title,
          date: String(event.date).slice(0, 10),
          endDate: event.end_date ? String(event.end_date).slice(0, 10) : undefined,
          description: event.description,
          status: event.status,
          ministry: event.ministry,
          category: event.category,
        });
      } else {
        // Event didn't have a GCal ID yet — create one
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
          await sql`UPDATE events SET google_calendar_event_id = ${gcalId} WHERE id = ${event.id}`;
          event.google_calendar_event_id = gcalId;
        }
      }

      return jsonResponse(event);
    }

    // DELETE /api/events?id=X — delete an event
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) {
        return errorResponse('id query parameter is required', 400);
      }
      const actor = url.searchParams.get('actor') || 'Admin';

      const existing = await sql`SELECT * FROM events WHERE id = ${id}`;
      if (existing.length === 0) {
        return errorResponse('Event not found', 404);
      }
      const event = existing[0];

      // Activity log (non-blocking)
      try {
        await sql`
          INSERT INTO event_activity_log (event_id, actor, action, summary)
          VALUES (${id}, ${actor}, 'deleted', ${`Event '${String(event.title).replace(/'/g, "''")}' deleted`})
        `;
      } catch (e) { console.error('[Activity Log] delete:', e); }

      await sql`DELETE FROM events WHERE id = ${id}`;

      // Remove from Google Calendar
      if (event.google_calendar_event_id) {
        await deleteGoogleCalendarEvent(event.google_calendar_event_id);
      }

      return jsonResponse({ deleted: true, event });
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Events API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
