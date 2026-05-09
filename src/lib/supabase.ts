import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key";

export const hasSupabaseConfig =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY) &&
  !supabaseUrl.includes("example.supabase.co");

if (!hasSupabaseConfig) {
  console.warn(
    "Supabase env vars are missing. The app will render, but auth and data features will not work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
