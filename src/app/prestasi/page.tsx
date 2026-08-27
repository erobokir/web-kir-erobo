import { isDiklatLoggedIn } from "@/lib/diklat/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { InventoryAuthProvider } from "@/lib/inventory/auth-context";
import PrestasiDashboard from "@/components/prestasi/PrestasiDashboard";
import type { PrestasiItem } from "@/types/prestasi";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prestasi KIR EROBO",
  description: "Kelola daftar prestasi KIR EROBO.",
};

export default async function PrestasiPage() {
  const isDiklat = isDiklatLoggedIn();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("prestasi_data")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  const items: PrestasiItem[] = data?.items ?? [];

  return (
    <div className="min-h-screen bg-space bg-hex-grid">
      <main className="mx-auto max-w-4xl px-4 pb-10 pt-24">
        {/* Ketua login lewat akun di tabel users (sistem inventaris), jadi
            halaman ini dibungkus InventoryAuthProvider supaya bisa deteksi
            role "ketua" dari token yang sama dipakai di /inventaris. */}
        <InventoryAuthProvider>
          <PrestasiDashboard initialItems={items} isDiklat={isDiklat} />
        </InventoryAuthProvider>
      </main>
    </div>
  );
}