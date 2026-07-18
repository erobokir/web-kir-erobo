"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/inventory/api";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import type { Item } from "@/types/inventory";

export default function BarangListPage() {
  const { user } = useInventoryAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await apiFetch<{ items: Item[] }>(
        `/api/items${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        { auth: false }
      );
      setItems(res.items);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-signal-cyan">Katalog</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Daftar Barang</h1>
        </div>
        {user?.role === "superadmin" && (
          <Link
            href="/inventaris/barang/tambah"
            className="rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white shadow-glow"
          >
            + Tambah Barang
          </Link>
        )}
        {user?.role === "divisi" && (
          <Link
            href="/inventaris/barang/tambah"
            className="rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white shadow-glow"
          >
            + Tambah Barang
          </Link>
        )}
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari nama barang..."
        className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none sm:max-w-sm"
      />

      {loading ? (
        <p className="text-sm text-ink-dim">Memuat...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/inventaris/barang/${item.id}`}
              className="rounded-2xl border border-space-line bg-space-panel/60 p-4 transition hover:border-signal-violet/40"
            >
              <p className="font-mono text-[11px] text-signal-cyan">{item.code}</p>
              <p className="mt-1 font-display font-semibold text-ink">{item.name}</p>
              <p className="text-xs text-ink-muted">{item.category || "Tanpa kategori"}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span
                  className={
                    item.quantity <= item.min_stock ? "font-semibold text-signal-gold" : "text-ink"
                  }
                >
                  {item.quantity} {item.unit}
                </span>
                <span className="text-xs text-ink-dim">{item.location || "-"}</span>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-ink-dim">Belum ada barang yang cocok.</p>
          )}
        </div>
      )}
    </div>
  );
}
