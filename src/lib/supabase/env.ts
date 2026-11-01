/**
 * Public Supabase settings for the "suffah" project.
 * These two values are PUBLIC by design: the anon key is sent to every
 * visitor's browser, and the database security rules (RLS) decide what it can do.
 * Environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY),
 * e.g. on Vercel or in .env.local, override these defaults.
 * NEVER put the service_role / secret key in this file.
 */
const DEFAULT_SUPABASE_URL = "https://arzeirkirqknwcyxjhzb.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyemVpcmtpcnFrbndjeXhqaHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MzM2MDYsImV4cCI6MjEwOTEwOTYwNn0._x8mDKgG72XG_dw3WfxT1NEWM8BM7XE_ofsCU0kvNno";

// NEXT_PUBLIC_* values are inlined at build time, so they must be referenced directly.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const PRODUCT_IMAGES_BUCKET = "product-images";

export function assertSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase settings. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}
