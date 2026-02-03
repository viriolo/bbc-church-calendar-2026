import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const sql = getDb();
  const url = new URL(req.url);

  try {
    // GET /api/activity?event_id=X — list activity log for an event
    if (req.method === 'GET') {
      const eventId = url.searchParams.get('event_id');
      if (!eventId) {
        return errorResponse('event_id query parameter is required', 400);
      }
      const rows = await sql`
        SELECT id, event_id, actor, action, summary, created_at
        FROM event_activity_log
        WHERE event_id = ${eventId}
        ORDER BY created_at DESC
      `;
      return jsonResponse(rows);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Activity API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
