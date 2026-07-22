import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { KasSession, KasRecord } from "@/types/keuangan";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("kas_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  return Response.json({ kas: data ?? { id: "main", sessions: [], updated_at: new Date().toISOString() } });
}

export async function POST(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const rl = checkRateLimit(`kas-save:${getClientIp(request)}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rl.allowed) return jsonError("Terlalu sering, tunggu sebentar.", 429);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Data tidak valid.", 400);

  const { periode, nominal_per_orang, records } = body as {
    periode?: string;
    nominal_per_orang?: number;
    records?: KasRecord[];
  };

  if (!periode || !nominal_per_orang || !Array.isArray(records) || records.length === 0) {
    return jsonError("Periode, nominal, dan records wajib diisi.", 400);
  }

  const newSession: KasSession = {
    id: `kas${Date.now()}`,
    periode: String(periode).slice(0, 100),
    nominal_per_orang: Number(nominal_per_orang),
    records,
    created_at: new Date().toISOString(),
  };

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("kas_data").select("*").eq("id", "main").maybeSingle();
  const currentSessions: KasSession[] = existing?.sessions ?? [];

  const { data, error } = await supabase
    .from("kas_data")
    .upsert({
      id: "main",
      sessions: [...currentSessions, newSession],
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ kas: data, session: newSession });
}

export async function PATCH(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Data tidak valid.", 400);

  const { session_id, peserta_id, status, tanggal_bayar, keterangan } = body as {
    session_id?: string;
    peserta_id?: string;
    status?: string;
    tanggal_bayar?: string;
    keterangan?: string;
  };

  if (!session_id || !peserta_id) return jsonError("session_id dan peserta_id wajib diisi.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("kas_data").select("*").eq("id", "main").maybeSingle();
  if (!existing) return jsonError("Data tidak ditemukan.", 404);

  const sessions: KasSession[] = existing.sessions ?? [];
  const updatedSessions = sessions.map((s) => {
    if (s.id !== session_id) return s;
    return {
      ...s,
      records: s.records.map((r) =>
        r.peserta_id === peserta_id
          ? {
              ...r,
              status: (status as KasRecord["status"]) ?? r.status,
              jumlah: status === "lunas" ? s.nominal_per_orang : 0,
              tanggal_bayar: tanggal_bayar ?? r.tanggal_bayar,
              keterangan: keterangan ?? r.keterangan,
            }
          : r
      ),
    };
  });

  const { data, error } = await supabase
    .from("kas_data")
    .update({ sessions: updatedSessions, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ kas: data });
}

export async function DELETE(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("ID wajib diisi.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("kas_data").select("*").eq("id", "main").maybeSingle();
  if (!existing) return jsonError("Data tidak ditemukan.", 404);

  const nextSessions = (existing.sessions as KasSession[]).filter((s) => s.id !== id);
  const { data, error } = await supabase
    .from("kas_data")
    .update({ sessions: nextSessions, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ kas: data });
}