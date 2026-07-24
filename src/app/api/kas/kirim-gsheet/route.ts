import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { KasSession } from "@/types/keuangan";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const { session_id } = await request.json().catch(() => ({}));
  if (!session_id) return jsonError("session_id wajib diisi.", 400);

  const gsheetUrl = process.env.GSHEET_KAS_WEBHOOK_URL;
  if (!gsheetUrl) return jsonError("GSHEET_KAS_WEBHOOK_URL belum diset.", 500);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("kas_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (!existing) return jsonError("Data kas tidak ditemukan.", 404);

  const sessions: KasSession[] = existing.sessions ?? [];
  const session = sessions.find((s) => s.id === session_id);
  if (!session) return jsonError("Periode kas tidak ditemukan.", 404);

  const payload = {
    session_id: session.id,
    periode: session.periode,
    nominal_per_orang: session.nominal_per_orang,
    created_at: session.created_at,
    records: session.records,
  };

  const gRes = await fetch(gsheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!gRes.ok) return jsonError("Gagal mengirim ke Google Sheets.", 502);

  const updatedSessions = sessions.map((s) =>
    s.id === session_id ? { ...s, dikirim_ke_gsheet: true } : s
  );

  await supabase
    .from("kas_data")
    .update({ sessions: updatedSessions, updated_at: new Date().toISOString() })
    .eq("id", "main");

  return Response.json({ success: true });
}