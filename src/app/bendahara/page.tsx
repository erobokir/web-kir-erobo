import { isBendaharaLoggedIn } from "@/lib/bendahara/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import KeuanganDashboard from "@/components/bendahara/KeuanganDashboard";
import type { KeuanganItem } from "@/types/keuangan";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Keuangan KIR EROBO",
  description: "Pengelolaan keuangan KIR EROBO.",
};

export default async function BendaharaPage() {
  const isEditor = isBendaharaLoggedIn();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("keuangan_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const items: KeuanganItem[] = data?.items ?? [];

  if (!isEditor) {
    return (
      <div className="min-h-screen bg-space bg-hex-grid">
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel/60 p-6 text-center">
            <p className="text-2xl">🔐</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">Akses Terbatas</h2>
            <p className="mt-1 text-sm text-ink-muted">Halaman ini hanya untuk bendahara.</p>
            <a
              href="/bendahara/login"
              className="mt-4 inline-block rounded-xl bg-signal-gold px-5 py-2.5 text-sm font-medium text-space"
            >
              Login Bendahara
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space bg-hex-grid">
      <main className="mx-auto max-w-5xl px-4 pb-10 pt-24">
        <KeuanganDashboard initialItems={items} isEditor={isEditor} />
      </main>
    </div>
  );
}
