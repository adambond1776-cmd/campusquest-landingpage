/**
 * Supabase credentials, read once and shared by the browser, server, and
 * middleware clients.
 *
 * Supabase is optional in development. Without credentials the auth flows fall
 * back to the local mock in `auth.ts`, so the marketing site stays clickable
 * locally. Production must never take that path. Nothing here throws at import.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
