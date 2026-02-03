import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const sql = getDb();
  const url = new URL(req.url);

  try {
    // GET /api/comments?event_id=X — list comments for an event
    if (req.method === 'GET') {
      const eventId = url.searchParams.get('event_id');
      if (!eventId) {
        return errorResponse('event_id query parameter is required', 400);
      }
      const rows = await sql`
        SELECT id, event_id, author, content, created_at
        FROM event_comments
        WHERE event_id = ${eventId}
        ORDER BY created_at ASC
      `;
      return jsonResponse(rows);
    }

    // POST /api/comments — add a comment (body: event_id, author?, content)
    if (req.method === 'POST') {
      const body = await req.json();
      const { event_id: eventId, author, content } = body;
      if (!eventId || content == null || String(content).trim() === '') {
        return errorResponse('event_id and content are required', 400);
      }
      const who = author || 'Admin';
      const result = await sql`
        INSERT INTO event_comments (event_id, author, content)
        VALUES (${eventId}, ${who}, ${String(content).trim()})
        RETURNING id, event_id, author, content, created_at
      `;
      return jsonResponse(result[0], 201);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Comments API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
