import type { Context } from '@netlify/functions';
import { corsHeaders } from './db.mts';

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders(),
    });
  }

  try {
    const body = await req.json();
    const { pin } = body;

    // Admin PIN is stored as environment variable on Netlify
    const adminPin = process.env.ADMIN_PIN || '2026';

    if (pin === adminPin) {
      return new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    return new Response(JSON.stringify({ authenticated: false, error: 'Invalid PIN' }), {
      status: 401,
      headers: corsHeaders(),
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: corsHeaders(),
    });
  }
}
