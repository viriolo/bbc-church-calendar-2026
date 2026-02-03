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
      const result = await sql`
        SELECT
          COUNT(*) AS total_events,
          COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_events,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_events,
          COUNT(*) FILTER (WHERE status IN ('draft', 'needs-sponsor')) AS needs_attention,
          COUNT(*) FILTER (
            WHERE date > CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '90 days'
          ) AS upcoming,
          COUNT(DISTINCT ministry) FILTER (WHERE ministry IS NOT NULL) AS ministries,
          COUNT(*) FILTER (
            WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
          ) AS this_month
        FROM events
      `;

      return jsonResponse(result[0]);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Stats API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
