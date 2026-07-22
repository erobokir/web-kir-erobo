import { isSekretarisLoggedIn } from "@/lib/sekretaris/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AbsensiSession } from "@/types/absensi";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  if (!isSekretarisLoggedIn()) return jsonError("Harus login sebagai sekretaris.", 401);

  const { session_id } = await request.json().catch(() => ({}));
  if (!session_id) return jsonError("session_id wajib diisi.", 400);

  const gsheetUrl = process.env.GSHEET_ABSENSI_WEBHOOK_URL;
  if (!gsheetUrl) return jsonError("GSHEET_ABSENSI_WEBHOOK_URL belum diset.", 500);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("absensi_data").select("*").eq("id", "main").maybeSingle();
  if (!existing) return jsonError("Data absensi tidak ditemukan.", 404);

  const sessions: AbsensiSession[] = existing.sessions ?? [];
  const session = sessions.find((s) => s.id === session_id);
  if (!session) return jsonError("Sesi absensi tidak ditemukan.", 404);

  const payload = {
    session_id: session.id,
    tanggal: session.tanggal,
    kegiatan: session.kegiatan,
    records: session.records,
  };

  const gRes = await fetch(gsheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!gRes.ok) {
    return jsonError("Gagal mengirim ke Google Sheets.", 502);
  }

  const updatedSessions = sessions.map((s) =>
    s.id === session_id ? { ...s, dikirim_ke_gsheet: true } : s
  );

  await supabase
    .from("absensi_data")
    .update({ sessions: updatedSessions, updated_at: new Date().toISOString() })
    .eq("id", "main");

  return Response.json({ success: true });
}