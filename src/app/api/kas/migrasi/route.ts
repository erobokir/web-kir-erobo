import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { KasSession } from "@/types/keuangan";
import type { KeuanganItem } from "@/types/keuangan";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST() {
  if (!isBendaharaLoggedIn()) return jsonError("Harus login sebagai bendahara.", 401);

  const supabase = createSupabaseAdminClient();

  const { data: kasData } = await supabase
    .from("kas_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (!kasData) return jsonError("Data kas tidak ditemukan.", 404);

  const { data: keuanganData } = await supabase
    .from("keuangan_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const existingItems: KeuanganItem[] = keuanganData?.items ?? [];
  const sessions: KasSession[] = kasData.sessions ?? [];

  const existingKasIds = new Set(
    existingItems
      .filter((i) => i.keperluan.startsWith("Kas "))
      .map((i) => i.keperluan)
  );

  const newItems: KeuanganItem[] = [];
  let count = 0;

  for (const session of sessions) {
    for (const record of session.records) {
      if (record.status !== "lunas") continue;

      const keperluan = `Kas ${session.periode} — ${record.nama}`;
      if (existingKasIds.has(keperluan)) continue;

      newItems.push({
        id: `kmig${Date.now()}${count}`,
        timestamp: record.tanggal_bayar ?? session.created_at,
        keperluan,
        status: "masuk",
        jumlah: record.jumlah > 0 ? record.jumlah : session.nominal_per_orang,
        created_at: record.tanggal_bayar ?? session.created_at,
      });
      count++;
    }
  }

  if (newItems.length === 0) {
    return Response.json({ success: true, migrated: 0, message: "Semua data sudah tersinkronisasi." });
  }

  const { error } = await supabase
    .from("keuangan_data")
    .upsert({
      id: "main",
      items: [...existingItems, ...newItems],
      updated_at: new Date().toISOString(),
    });

  if (error) return jsonError(error.message, 500);

  return Response.json({ success: true, migrated: newItems.length });
}