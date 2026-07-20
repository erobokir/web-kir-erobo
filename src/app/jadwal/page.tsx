import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import JadwalDashboard from "@/components/jadwal/JadwalDashboard";
import type { JadwalItem } from "@/types/jadwal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jadwal Kegiatan – KIR EROBO",
  description: "Jadwal kegiatan dan pelatihan KIR EROBO.",
};

export default async function JadwalPage() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("jadwal_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const items: JadwalItem[] = data?.items ?? [];

  return <JadwalDashboard initialItems={items} />;
}
