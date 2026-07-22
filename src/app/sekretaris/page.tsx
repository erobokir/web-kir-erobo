import { isSekretarisLoggedIn } from "@/lib/sekretaris/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AbsensiDashboard from "@/components/sekretaris/AbsensiDashboard";
import type { AbsensiSession } from "@/types/absensi";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Absensi KIR EROBO",
  description: "Sistem absensi kegiatan KIR EROBO.",
};

export default async function SekretarisPage() {
  const isEditor = isSekretarisLoggedIn();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("absensi_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const sessions: AbsensiSession[] = data?.sessions ?? [];

  if (!isEditor) {
    return (
      <div className="min-h-screen bg-space bg-hex-grid">
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel/60 p-6 text-center">
            <p className="text-2xl">🔐</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">Akses Terbatas</h2>
            <p className="mt-1 text-sm text-ink-muted">Halaman ini hanya untuk sekretaris.</p>
            <a
              href="/sekretaris/login"
              className="mt-4 inline-block rounded-xl bg-signal-cyan px-5 py-2.5 text-sm font-medium text-space"
            >
              Login Sekretaris
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space bg-hex-grid">
      <main className="mx-auto max-w-3xl px-4 pb-10 pt-24">
        <AbsensiDashboard initialSessions={sessions} />
      </main>
    </div>
  );
}