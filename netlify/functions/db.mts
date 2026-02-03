import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(url);
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}

export function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders(),
  });
}
