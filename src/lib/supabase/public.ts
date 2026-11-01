import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from "./env";

/**
 * Client for public, cookie-free reads (shop pages) and for placing orders.
 * It never has a logged-in user, so security rules only let it see
 * visible products, images, categories and settings.
 */
export function createPublicClient() {
  assertSupabaseEnv();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
