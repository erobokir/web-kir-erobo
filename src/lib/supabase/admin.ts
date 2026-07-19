import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client dengan service_role key. BYPASS RLS sepenuhnya.
 * HANYA boleh dipakai di kode server (Route Handler / Server Action),
 * TIDAK PERNAH di Client Component. Paket "server-only" akan membuat
 * build gagal kalau file ini ter-import ke bundle client secara tidak sengaja.
 *
 * Dipakai untuk:
 * - Melayani file publik di /web/[slug]/** (butuh baca lintas-user)
 * - Operasi storage (upload/rename/delete) setelah otorisasi divalidasi manual
 * - Mencatat analytics visitor (insert tanpa session user)
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
