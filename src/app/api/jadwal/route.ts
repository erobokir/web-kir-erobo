import { isDiklatLoggedIn } from "@/lib/diklat/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { JadwalItem } from "@/types/jadwal";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

function validateItem(body: unknown): Omit<JadwalItem, "id" | "created_at"> | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const nama_materi = typeof b.nama_materi === "string" ? b.nama_materi.slice(0, 200) : "";
  const tanggal_kegiatan = typeof b.tanggal_kegiatan === "string" ? b.tanggal_kegiatan : "";
  const keterangan = typeof b.keterangan === "string" ? b.keterangan.slice(0, 1000) : "";
  const pemateri = typeof b.pemateri === "string" ? b.pemateri.slice(0, 200) : "";

  if (!nama_materi || !tanggal_kegiatan || !pemateri) return null;
  // Validate ISO date
  if (isNaN(new Date(tanggal_kegiatan).getTime())) return null;

  return { nama_materi, tanggal_kegiatan, keterangan, pemateri };
}

/** GET – semua orang bisa lihat jadwal */
export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("jadwal_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) return jsonError(error.message, 500);

  const jadwal = data ?? {
    id: "main",
    items: [],
    updated_at: new Date().toISOString(),
  };

  return Response.json({ jadwal });
}

/** POST – tambah jadwal baru, hanya role diklat */
export async function POST(request: Request) {
  if (!isDiklatLoggedIn()) {
    return jsonError("Harus login sebagai diklat untuk menambah jadwal.", 401);
  }

  const rl = checkRateLimit(`jadwal-save:${getClientIp(request)}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return jsonError("Terlalu sering, tunggu sebentar.", 429);

  const body = await request.json().catch(() => null);
  const validated = validateItem(body);
  if (!validated) return jsonError("Data jadwal tidak valid.", 400);

  const supabase = createSupabaseAdminClient();

  // Ambil data saat ini
  const { data: existing } = await supabase
    .from("jadwal_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const currentItems: JadwalItem[] = existing?.items ?? [];
  const newItem: JadwalItem = {
    id: `j${Date.now()}`,
    ...validated,
    created_at: new Date().toISOString(),
  };

  const nextItems = [...currentItems, newItem];

  const { data, error } = await supabase
    .from("jadwal_data")
    .upsert({
      id: "main",
      items: nextItems,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ jadwal: data, item: newItem });
}

/** DELETE – hapus jadwal by id, hanya role diklat */
export async function DELETE(request: Request) {
  if (!isDiklatLoggedIn()) {
    return jsonError("Harus login sebagai diklat untuk menghapus jadwal.", 401);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("ID jadwal wajib diisi.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("jadwal_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (!existing) return jsonError("Data jadwal tidak ditemukan.", 404);

  const nextItems = (existing.items as JadwalItem[]).filter((item) => item.id !== id);

  const { data, error } = await supabase
    .from("jadwal_data")
    .update({ items: nextItems, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ jadwal: data });
}
