import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { KeuanganItem } from "@/types/keuangan";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const { tanggal } = await request.json().catch(() => ({}));
  if (!tanggal) return jsonError("tanggal wajib diisi.", 400);

  const gsheetUrl = process.env.GSHEET_KEUANGAN_WEBHOOK_URL;
  if (!gsheetUrl) return jsonError("GSHEET_KEUANGAN_WEBHOOK_URL belum diset.", 500);

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("keuangan_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (!existing) return jsonError("Data keuangan tidak ditemukan.", 404);

  const items: KeuanganItem[] = existing.items ?? [];
  const filtered = items.filter(
    (i) => new Date(i.timestamp).toISOString().slice(0, 10) === tanggal
  );
  if (filtered.length === 0) return jsonError("Tidak ada transaksi pada tanggal ini.", 404);

  const payload = { tanggal, items: filtered };

  const gRes = await fetch(gsheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!gRes.ok) return jsonError("Gagal mengirim ke Google Sheets.", 502);

  const updatedItems = items.map((i) =>
    new Date(i.timestamp).toISOString().slice(0, 10) === tanggal
      ? { ...i, dikirim_ke_gsheet: true }
      : i
  );

  await supabase
    .from("keuangan_data")
    .update({ items: updatedItems, updated_at: new Date().toISOString() })
    .eq("id", "main");

  return Response.json({ success: true, total: filtered.length });
}