import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// Client-side Supabase client
export const createClientClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(supabaseUrl, supabaseKey);
};

// Admin Supabase client (for server-side operations)
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

// Singleton client for use in components
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
};
