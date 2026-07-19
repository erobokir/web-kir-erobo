import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk dipakai di Client Component ("use client").
 * Menggunakan anon key + tunduk pada RLS (bukan service role).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
