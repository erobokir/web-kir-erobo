"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import type { Role } from "@/types/inventory";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
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
  const items = NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Header Mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-space-line bg-space-panel/80 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="font-display text-sm font-semibold text-ink">
            Inventaris
          </p>
          <p className="text-[11px] text-ink-dim">
            Sekretariat KIR EROBO
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-space-line p-2 text-ink"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          border-r border-space-line
          bg-space-panel/95 backdrop-blur
          transition-transform duration-300

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:sticky lg:z-auto lg:translate-x-0
          lg:w-64 lg:shrink-0
        `}
      >
        <div className="flex items-start justify-between border-b border-space-line px-5 py-5">
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              Inventaris
            </p>
            <p className="text-xs text-ink-dim">
              Sekretariat KIR EROBO
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-ink lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {user ? (
          <div className="border-b border-space-line px-5 py-4">
            <p className="text-sm text-ink">
              {user.name}
            </p>

            <p className="mt-1 text-xs uppercase tracking-wider text-signal-cyan">
              {roleLabel(user.role)}
            </p>
          </div>
        ) : (
          <div className="p-4">
            <Link
              href="/inventaris/login"
              className="flex justify-center rounded-xl bg-signal-violet/20 px-4 py-3 text-sm font-medium text-signal-violet"
            >
              Masuk
            </Link>
          </div>
        )}

        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  rounded-xl px-4 py-3 text-sm transition
                  ${
                    active
                      ? "bg-signal-violet/15 text-signal-violet"
                      : "text-ink-muted hover:bg-space-panel2 hover:text-ink"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="mt-auto p-3">
            <button
              onClick={logout}
              className="w-full rounded-xl border border-space-line px-4 py-3 text-left text-sm text-ink-dim hover:border-signal-violet/40 hover:text-ink"
            >
              Keluar
            </button>
          </div>
        )}
      </aside>
    </>
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