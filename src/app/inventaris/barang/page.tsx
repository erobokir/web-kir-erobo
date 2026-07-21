"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/inventory/api";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import { roleLabel } from "@/components/inventory/Sidebar";
import KeuanganWidget from "@/components/inventory/KeuanganWidget";
import type { DashboardSummary, Item } from "@/types/inventory";

export default function InventarisDashboardPage() {
  const { user } = useInventoryAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, i] = await Promise.all([
          apiFetch<DashboardSummary>("/api/dashboard/summary", { auth: false }),
          apiFetch<{ items: Item[] }>("/api/items", { auth: false }),
        ]);
        setSummary(s);
        setItems(i.items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await apiFetch<{ items: Item[] }>(
        `/api/items${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        { auth: false }
      );
      setItems(res.items);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-signal-cyan">
          Monitoring Ketersediaan Barang
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Halo{user ? `, ${user.name}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {user
            ? `Kamu masuk sebagai ${roleLabel(user.role)}.`
            : "Kamu sedang melihat sebagai tamu (guest). Login untuk mengakses fitur pendataan."}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Jenis Barang" value={summary?.totalItems} />
        <SummaryCard label="Total Stok" value={summary?.totalStock} />
        <SummaryCard label="Stok Menipis" value={summary?.lowStockCount} accent="gold" />
        <SummaryCard label="Pengajuan Menunggu" value={summary?.pendingRequests} accent="violet" />
      </section>

      {(user?.role === "ketua" || user?.role === "superadmin") && <KeuanganWidget />}

      <section className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Daftar Barang</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama barang..."
            className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none sm:w-64"
          />
        </div>

        {loading ? (
          <p className="text-sm text-ink-dim">Memuat data barang...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-dim">Barang tidak ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-space-line text-ink-dim">
                  <th className="py-2 pr-4 font-medium">Kode</th>
                  <th className="py-2 pr-4 font-medium">Nama Barang</th>
                  <th className="py-2 pr-4 font-medium">Kategori</th>
                  <th className="py-2 pr-4 font-medium">Stok</th>
                  <th className="py-2 pr-4 font-medium">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-space-line/60">
                    <td className="py-2.5 pr-4 font-mono text-xs text-signal-cyan">
                      <Link href={`/inventaris/barang/${item.id}`}>{item.code}</Link>
                    </td>
                    <td className="py-2.5 pr-4 text-ink">
                      <Link href={`/inventaris/barang/${item.id}`} className="hover:text-signal-violet">
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-ink-muted">{item.category || "-"}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={
                          item.quantity <= item.min_stock
                            ? "font-semibold text-signal-gold"
                            : "text-ink"
                        }
                      >
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-ink-muted">{item.location || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "cyan",
}: {
  label: string;
  value?: number;
  accent?: "cyan" | "gold" | "violet";
}) {
  const colors = {
    cyan: "text-signal-cyan",
    gold: "text-signal-gold",
    violet: "text-signal-violet",
  } as const;
  return (
    <div className="rounded-2xl border border-space-line bg-space-panel/60 p-4">
      <p className="text-xs text-ink-dim">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${colors[accent]}`}>
        {value ?? "-"}
      </p>
    </div>
  );
}