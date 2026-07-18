"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import type { Role } from "@/types/inventory";

interface NavItem {
  href: string;
  label: string;
  roles: Role[]; // role yang boleh melihat menu ini
}

const NAV_ITEMS: NavItem[] = [
  { href: "/inventaris", label: "Dashboard", roles: ["superadmin", "ketua", "divisi", "guest"] },
  { href: "/inventaris/barang", label: "Katalog Barang", roles: ["superadmin", "ketua", "divisi", "guest"] },
  { href: "/inventaris/scan", label: "Scan QR", roles: ["superadmin", "ketua", "divisi", "guest"] },
  { href: "/inventaris/masuk", label: "Barang Masuk", roles: ["superadmin", "divisi"] },
  { href: "/inventaris/keluar", label: "Ajukan Peminjaman", roles: ["divisi", "superadmin"] },
  { href: "/inventaris/persetujuan", label: "Persetujuan Pengajuan", roles: ["ketua", "superadmin"] },
  { href: "/inventaris/serah-terima", label: "Serah Terima Barang", roles: ["divisi", "superadmin"] },
  { href: "/inventaris/pengembalian", label: "Barang Kembali", roles: ["divisi", "superadmin"] },
  { href: "/inventaris/laporan", label: "Laporan Transaksi", roles: ["superadmin", "ketua", "divisi"] },
  { href: "/inventaris/users", label: "Kelola Akun", roles: ["superadmin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useInventoryAuth();
  const role: Role = user?.role || "guest";

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full shrink-0 border-b border-space-line bg-space-panel/60 backdrop-blur lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:sticky lg:top-0">
      <div className="flex items-center justify-between px-5 py-4 lg:flex-col lg:items-start lg:gap-1">
        <div>
          <p className="font-display text-sm font-semibold text-ink">Inventaris</p>
          <p className="text-xs text-ink-dim">Sekretariat KIR EROBO</p>
        </div>
        {user ? (
          <div className="text-right lg:mt-4 lg:w-full lg:text-left">
            <p className="text-xs text-ink-muted">{user.name}</p>
            <p className="text-[10px] uppercase tracking-wide text-signal-cyan">{roleLabel(user.role)}</p>
          </div>
        ) : (
          <Link
            href="/inventaris/login"
            className="rounded-full bg-signal-violet/20 px-3 py-1.5 text-xs font-medium text-signal-violet lg:mt-4"
          >
            Masuk
          </Link>
        )}
      </div>

      <nav className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col lg:gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-signal-violet/15 text-signal-violet"
                  : "text-ink-muted hover:bg-space-panel2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-3 pb-5">
          <button
            onClick={logout}
            className="w-full rounded-lg border border-space-line px-3 py-2 text-left text-sm text-ink-dim hover:border-signal-violet/40 hover:text-ink"
          >
            Keluar
          </button>
        </div>
      )}
    </aside>
  );
}

export function roleLabel(role: Role) {
  switch (role) {
    case "superadmin":
      return "Super Admin";
    case "ketua":
      return "Ketua Ekskul";
    case "divisi":
      return "Divisi Organisasi";
    default:
      return "Guest";
  }
}
