import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side admin operations.");
  if (!url) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL must be set in the server environment.");
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

export default getSupabaseAdmin;
