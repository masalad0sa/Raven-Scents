import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceKey) {
  throw new Error('Missing Supabase SERVICE environment variables');
}
if (!url) {
  throw new Error('Missing Supabase URL environment variables');
}
if (!anonKey) {
  throw new Error('Missing Supabase ANON environment variables');
}

// Public client — respects Row Level Security (for public reads)
export const supabase = createClient(url, anonKey);

// Admin client — bypasses RLS (for server-side writes)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
