import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { KasRecord, KasSession } from "@/types/keuangan";
import type { KeuanganItem } from "@/types/keuangan";

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

  const { data: kasExisting } = await supabase.from("kas_data").select("*").eq("id", "main").maybeSingle();
  if (!kasExisting) return jsonError("Data tidak ditemukan.", 404);

  const sessions: KasSession[] = kasExisting.sessions ?? [];
  const session = sessions.find((s) => s.id === session_id);
  if (!session) return jsonError("Sesi tidak ditemukan.", 404);

  const record = session.records.find((r) => r.peserta_id === peserta_id);
  if (!record) return jsonError("Peserta tidak ditemukan.", 404);

  const prevStatus = record.status;
  const newStatus = (status as KasRecord["status"]) ?? prevStatus;
  const nominal = session.nominal_per_orang;
  const now = new Date().toISOString();

  const updatedSessions = sessions.map((s) => {
    if (s.id !== session_id) return s;
    return {
      ...s,
      records: s.records.map((r) =>
        r.peserta_id === peserta_id
          ? {
              ...r,
              status: newStatus,
              jumlah: newStatus === "lunas" ? nominal : 0,
              tanggal_bayar: newStatus === "lunas" ? (tanggal_bayar ?? now) : undefined,
              keterangan: keterangan ?? r.keterangan,
            }
          : r
      ),
    };
  });

  const { data: kasData, error: kasError } = await supabase
    .from("kas_data")
    .update({ sessions: updatedSessions, updated_at: now })
    .eq("id", "main")
    .select()
    .single();

  if (kasError) return jsonError(kasError.message, 500);

  if (prevStatus !== newStatus) {
    const { data: keuanganExisting } = await supabase
      .from("keuangan_data")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    const currentItems: KeuanganItem[] = keuanganExisting?.items ?? [];

    if (newStatus === "lunas") {
      const newItem: KeuanganItem = {
        id: `k${Date.now()}`,
        timestamp: now,
        keperluan: `Kas ${session.periode} — ${record.nama}`,
        status: "masuk",
        jumlah: nominal,
        created_at: now,
      };
      await supabase
        .from("keuangan_data")
        .upsert({
          id: "main",
          items: [...currentItems, newItem],
          updated_at: now,
        });
    } else if (prevStatus === "lunas" && newStatus === "belum") {
      const revertItem: KeuanganItem = {
        id: `k${Date.now()}`,
        timestamp: now,
        keperluan: `Batal kas ${session.periode} — ${record.nama}`,
        status: "keluar",
        jumlah: nominal,
        created_at: now,
      };
      await supabase
        .from("keuangan_data")
        .upsert({
          id: "main",
          items: [...currentItems, revertItem],
          updated_at: now,
        });
    }
  }

  return Response.json({ kas: kasData });
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