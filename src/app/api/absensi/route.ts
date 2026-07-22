import { isSekretarisLoggedIn } from "@/lib/sekretaris/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { AbsensiSession } from "@/types/absensi";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("absensi_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  return Response.json({ absensi: data ?? { id: "main", sessions: [], updated_at: new Date().toISOString() } });
}

export async function POST(request: Request) {
  if (!isSekretarisLoggedIn()) return jsonError("Harus login sebagai sekretaris.", 401);

  const rl = checkRateLimit(`absensi-save:${getClientIp(request)}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rl.allowed) return jsonError("Terlalu sering, tunggu sebentar.", 429);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Data tidak valid.", 400);

  const { tanggal, kegiatan, records } = body as { tanggal?: string; kegiatan?: string; records?: unknown[] };
  if (!tanggal || !kegiatan || !Array.isArray(records) || records.length === 0) {
    return jsonError("Tanggal, kegiatan, dan records wajib diisi.", 400);
  }

  const newSession: AbsensiSession = {
    id: `abs${Date.now()}`,
    tanggal,
    kegiatan: String(kegiatan).slice(0, 200),
    records: records as AbsensiSession["records"],
    created_at: new Date().toISOString(),
    dikirim_ke_gsheet: false,
  };

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("absensi_data").select("*").eq("id", "main").maybeSingle();
  const currentSessions: AbsensiSession[] = existing?.sessions ?? [];

  const { data, error } = await supabase
    .from("absensi_data")
    .upsert({
      id: "main",
      sessions: [...currentSessions, newSession],
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ absensi: data, session: newSession });
}

export async function DELETE(request: Request) {
  if (!isSekretarisLoggedIn()) return jsonError("Harus login sebagai sekretaris.", 401);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("ID wajib diisi.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("absensi_data").select("*").eq("id", "main").maybeSingle();
  if (!existing) return jsonError("Data tidak ditemukan.", 404);

  const nextSessions = (existing.sessions as AbsensiSession[]).filter((s) => s.id !== id);
  const { data, error } = await supabase
    .from("absensi_data")
    .update({ sessions: nextSessions, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ absensi: data });
}