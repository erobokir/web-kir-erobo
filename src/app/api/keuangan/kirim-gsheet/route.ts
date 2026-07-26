import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { KeuanganItem } from "@/types/keuangan";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST() {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

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
  const belumDikirim = items.filter((i) => !i.dikirim_ke_gsheet);

  if (belumDikirim.length === 0) {
    return Response.json({ success: true, total: 0, message: "Semua transaksi sudah pernah dikirim." });
  }

  const gRes = await fetch(gsheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: belumDikirim }),
  });
  if (!gRes.ok) return jsonError("Gagal mengirim ke Google Sheets.", 502);

  const updatedItems = items.map((i) =>
    !i.dikirim_ke_gsheet ? { ...i, dikirim_ke_gsheet: true } : i
  );

  await supabase
    .from("keuangan_data")
    .update({ items: updatedItems, updated_at: new Date().toISOString() })
    .eq("id", "main");

  return Response.json({ success: true, total: belumDikirim.length });
}