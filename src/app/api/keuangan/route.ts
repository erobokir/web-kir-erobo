import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { KeuanganItem } from "@/types/keuangan";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

function validateItem(body: unknown): Omit<KeuanganItem, "id" | "created_at"> | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const keperluan = typeof b.keperluan === "string" ? b.keperluan.slice(0, 300) : "";
  const status = b.status === "masuk" || b.status === "keluar" ? b.status : null;
  const jumlah = typeof b.jumlah === "number" ? b.jumlah : parseFloat(String(b.jumlah));
  const timestamp = typeof b.timestamp === "string" ? b.timestamp : "";
  if (!keperluan || !status || isNaN(jumlah) || jumlah <= 0 || !timestamp) return null;
  if (isNaN(new Date(timestamp).getTime())) return null;
  return { keperluan, status, jumlah, timestamp };
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("keuangan_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  const keuangan = data ?? { id: "main", items: [], updated_at: new Date().toISOString() };
  return Response.json({ keuangan });
}

export async function POST(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const rl = checkRateLimit(`keuangan-save:${getClientIp(request)}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) return jsonError("Terlalu sering, tunggu sebentar.", 429);

  const body = await request.json().catch(() => null);
  const validated = validateItem(body);
  if (!validated) return jsonError("Data keuangan tidak valid.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("keuangan_data").select("*").eq("id", "main").maybeSingle();

  const currentItems: KeuanganItem[] = existing?.items ?? [];
  const newItem: KeuanganItem = {
    id: `k${Date.now()}`,
    ...validated,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("keuangan_data")
    .upsert({ id: "main", items: [...currentItems, newItem], updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ keuangan: data, item: newItem });
}

export async function DELETE(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("ID wajib diisi.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("keuangan_data").select("*").eq("id", "main").maybeSingle();
  if (!existing) return jsonError("Data tidak ditemukan.", 404);

  const nextItems = (existing.items as KeuanganItem[]).filter((item) => item.id !== id);
  const { data, error } = await supabase
    .from("keuangan_data")
    .update({ items: nextItems, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ keuangan: data });
}
