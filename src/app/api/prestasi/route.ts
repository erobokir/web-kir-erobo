import { isDiklatLoggedIn } from "@/lib/diklat/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { PrestasiItem, PrestasiTier } from "@/types/prestasi";

const VALID_TIERS: PrestasiTier[] = ["gold", "silver", "bronze", "special"];

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

/**
 * Ketua sudah punya akun di tabel `users` sistem inventaris (login via
 * /inventaris/login, JWT dari backend inventaris). Untuk memverifikasi
 * role "ketua" di sini, kita cek token itu ke endpoint /api/auth/me milik
 * backend inventaris yang sama dipakai oleh useInventoryAuth().
 */
async function isKetuaFromInventoryToken(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  // Buang trailing slash supaya tidak jadi "host//api/auth/me" (lihat catatan
  // di src/lib/inventory/api.ts).
  const apiBase = (
    process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:4000"
  ).replace(/\/+$/, "");

  try {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    const role = data?.user?.role;
    return role === "ketua" || role === "superadmin";
  } catch {
    return false;
  }
}

async function isAuthorized(request: Request): Promise<boolean> {
  if (isDiklatLoggedIn()) return true;
  return isKetuaFromInventoryToken(request);
}

function validateItem(body: unknown): Omit<PrestasiItem, "id" | "created_at"> | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 200) : "";
  const event = typeof b.event === "string" ? b.event.trim().slice(0, 200) : "";
  const year = typeof b.year === "string" ? b.year.trim().slice(0, 10) : "";
  const tier = VALID_TIERS.includes(b.tier as PrestasiTier) ? (b.tier as PrestasiTier) : null;
  if (!title || !year || !tier) return null;
  return { title, event, year, tier };
}

/** Normalisasi judul untuk dibandingkan: lowercase + spasi berlebih dirapikan. */
function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Cek apakah sudah ada prestasi dengan judul + tahun yang sama persis. */
function findDuplicate(
  items: PrestasiItem[],
  candidate: Omit<PrestasiItem, "id" | "created_at">
): PrestasiItem | undefined {
  const normalizedTitle = normalizeTitle(candidate.title);
  return items.find(
    (item) => normalizeTitle(item.title) === normalizedTitle && item.year === candidate.year
  );
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("prestasi_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  const prestasi = data ?? { id: "main", items: [], updated_at: new Date().toISOString() };
  return Response.json({ prestasi });
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return jsonError("Harus login sebagai ketua atau diklat.", 401);
  }

  const rl = checkRateLimit(`prestasi-save:${getClientIp(request)}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) return jsonError("Terlalu sering, tunggu sebentar.", 429);

  const body = await request.json().catch(() => null);
  const validated = validateItem(body);
  if (!validated) return jsonError("Data prestasi tidak valid.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("prestasi_data").select("*").eq("id", "main").maybeSingle();

  const currentItems: PrestasiItem[] = existing?.items ?? [];

  const duplicate = findDuplicate(currentItems, validated);
  if (duplicate) {
    return jsonError(
      `Prestasi "${duplicate.title}" (${duplicate.year}) sudah ada, tidak bisa ditambahkan lagi.`,
      409
    );
  }

  const newItem: PrestasiItem = {
    id: `p${Date.now()}`,
    ...validated,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("prestasi_data")
    .upsert({ id: "main", items: [...currentItems, newItem], updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ prestasi: data, item: newItem });
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized(request))) {
    return jsonError("Harus login sebagai ketua atau diklat.", 401);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("ID wajib diisi.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("prestasi_data").select("*").eq("id", "main").maybeSingle();
  if (!existing) return jsonError("Data tidak ditemukan.", 404);

  const nextItems = (existing.items as PrestasiItem[]).filter((item) => item.id !== id);
  const { data, error } = await supabase
    .from("prestasi_data")
    .update({ items: nextItems, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ prestasi: data });
}