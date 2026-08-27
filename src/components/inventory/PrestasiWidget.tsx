"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PrestasiItem, PrestasiTier } from "@/types/prestasi";

const TIER_LABEL: Record<PrestasiTier, string> = {
  gold: "🥇 Gold",
  silver: "🥈 Silver",
  bronze: "🥉 Bronze",
  special: "⭐ Special",
};

export default function PrestasiWidget() {
  const [items, setItems] = useState<PrestasiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prestasi")
      .then((r) => r.json())
      .then(({ prestasi }) => setItems(prestasi?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const recent = [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <section className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Prestasi</h2>
          <p className="text-xs text-ink-dim">Dikelola oleh ketua & diklat</p>
        </div>
        <Link
          href="/prestasi"
          className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          Lihat semua ↗
        </Link>
      </div>

      <div className="mb-4">
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Total Prestasi Tercatat</p>
          <p className="mt-0.5 font-display text-lg font-semibold text-signal-gold">
            {loading ? "—" : items.length}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-ink-dim">Memuat data prestasi…</p>
      ) : recent.length === 0 ? (
        <p className="text-xs text-ink-dim">Belum ada prestasi.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-dim">Terbaru Ditambahkan</p>
          {recent.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{item.title}</p>
                <p className="text-[10px] text-ink-dim">{item.year}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-ink-muted">{TIER_LABEL[item.tier]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}