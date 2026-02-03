import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';

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
      const { title, date, end_date, status, ministry, description, budget, sponsor, category } = body;

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

      return jsonResponse(result[0], 201);
    }

    // PUT /api/events?id=X — update an event
    if (req.method === 'PUT') {
      const id = url.searchParams.get('id');
      if (!id) {
        return errorResponse('id query parameter is required', 400);
      }

      const body = await req.json();
      const { title, date, end_date, status, ministry, description, budget, sponsor, category } = body;

      const result = await sql`
        UPDATE events SET
          title = COALESCE(${title || null}, title),
          date = COALESCE(${date || null}, date),
          end_date = ${end_date ?? null},
          status = COALESCE(${status || null}, status),
          ministry = COALESCE(${ministry || null}, ministry),
          description = COALESCE(${description || null}, description),
          budget = ${budget ?? null},
          sponsor = ${sponsor ?? null},
          category = COALESCE(${category || null}, category),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Event not found', 404);
      }

      return jsonResponse(result[0]);
    }

    // DELETE /api/events?id=X — delete an event
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) {
        return errorResponse('id query parameter is required', 400);
      }

      const result = await sql`
        DELETE FROM events WHERE id = ${id} RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Event not found', 404);
      }

      return jsonResponse({ deleted: true, event: result[0] });
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
