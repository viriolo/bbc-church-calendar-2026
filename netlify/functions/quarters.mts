import type { Context } from '@netlify/functions';
import { getDb, jsonResponse, errorResponse, corsHeaders } from './db.mts';

export default async function handler(req: Request, _context: Context) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      // Get all quarters with computed event stats
      const quarters = await sql`
        SELECT
          q.*,
          COALESCE(stats.total_events, 0) AS total_events,
          COALESCE(stats.confirmed_events, 0) AS confirmed_events,
          COALESCE(stats.pending_events, 0) AS pending_events,
          CASE
            WHEN COALESCE(stats.total_events, 0) > 0
            THEN ROUND((COALESCE(stats.confirmed_events, 0)::numeric / stats.total_events) * 100)
            ELSE 0
          END AS progress
        FROM quarters q
        LEFT JOIN (
          SELECT
            CASE
              WHEN EXTRACT(MONTH FROM date) BETWEEN 1 AND 3 THEN 'Q1'
              WHEN EXTRACT(MONTH FROM date) BETWEEN 4 AND 6 THEN 'Q2'
              WHEN EXTRACT(MONTH FROM date) BETWEEN 7 AND 9 THEN 'Q3'
              ELSE 'Q4'
            END AS quarter_name,
            COUNT(*) AS total_events,
            COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_events,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending_events
          FROM events
          GROUP BY quarter_name
        ) stats ON stats.quarter_name = q.name
        ORDER BY q.id
      `;

      return jsonResponse(quarters);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Quarters API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
