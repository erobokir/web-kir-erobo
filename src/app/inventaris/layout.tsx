import type { Metadata } from "next";
import { InventoryAuthProvider } from "@/lib/inventory/auth-context";
import Sidebar from "@/components/inventory/Sidebar";

export const metadata: Metadata = {
  title: "Inventaris Sekretariat",
  description:
    "Sistem monitoring & pendataan barang sekretariat ekskul KIR EROBO: scan QR, barang masuk, barang keluar, dan peminjaman.",
};

export default function InventarisLayout({ children }: { children: React.ReactNode }) {
  return (
    <InventoryAuthProvider>
      <div className="min-h-screen bg-space bg-hex-grid text-ink">
        <div className="flex flex-col lg:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </InventoryAuthProvider>
  );
}
