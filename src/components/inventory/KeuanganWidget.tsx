"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { KasSession, KeuanganItem, KeuanganSummary } from "@/types/keuangan";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function calcSummary(items: KeuanganItem[]): KeuanganSummary {
  let total_masuk = 0;
  let total_keluar = 0;
  for (const item of items) {
    if (item.status === "masuk") total_masuk += item.jumlah;
    else total_keluar += item.jumlah;
  }
  return { total_masuk, total_keluar, saldo: total_masuk - total_keluar, total_transaksi: items.length };
}

function calcKasTerkumpul(sessions: KasSession[]) {
  let terkumpul = 0;
  let lunas = 0;
  let belum = 0;
  for (const s of sessions) {
    for (const r of s.records) {
      if (r.status === "lunas") { terkumpul += r.jumlah; lunas++; }
      else belum++;
    }
  }
  return { terkumpul, lunas, belum };
}

export default function KeuanganWidget() {
  const [items, setItems] = useState<KeuanganItem[]>([]);
  const [sessions, setSessions] = useState<KasSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/keuangan").then((r) => r.json()),
      fetch("/api/kas").then((r) => r.json()),
    ]).then(([keuanganRes, kasRes]) => {
      setItems(keuanganRes.keuangan?.items ?? []);
      setSessions(kasRes.kas?.sessions ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const summary = calcSummary(items);
  const kas = calcKasTerkumpul(sessions);
  const recent = [...items]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  return (
    <section className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Keuangan & Kas</h2>
          <p className="text-xs text-ink-dim">Laporan dari bendahara</p>
        </div>
        <Link
          href="/bendahara"
          className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          Lihat semua ↗
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Saldo</p>
          <p className={`mt-0.5 font-display text-sm font-semibold ${summary.saldo >= 0 ? "text-signal-teal" : "text-signal-gold"}`}>
            {loading ? "—" : formatRupiah(summary.saldo)}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Total Masuk</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-signal-cyan">
            {loading ? "—" : formatRupiah(summary.total_masuk)}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Kas Terkumpul</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-signal-violet">
            {loading ? "—" : formatRupiah(kas.terkumpul)}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Belum Bayar Kas</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-signal-gold">
            {loading ? "—" : `${kas.belum} orang`}
          </p>
        </div>
      </div>

      {!loading && sessions.length > 0 && (
        <div className="mb-4 rounded-xl border border-space-line bg-space-panel2/30 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
            Periode Kas Terkini
          </p>
          {sessions.slice(-1).map((s) => {
            const l = s.records.filter((r) => r.status === "lunas").length;
            const total = s.records.length;
            const pct = total > 0 ? Math.round((l / total) * 100) : 0;
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{s.periode}</p>
                  <span className="text-xs text-ink-dim">{l}/{total} lunas</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-space-line">
                  <div
                    className="h-full rounded-full bg-signal-teal transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-ink-dim">Memuat data…</p>
      ) : recent.length === 0 ? (
        <p className="text-xs text-ink-dim">Belum ada transaksi.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-dim">Transaksi Terbaru</p>
          {recent.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{item.keperluan}</p>
                <p className="text-[10px] text-ink-dim">{formatDate(item.timestamp)}</p>
              </div>
              <span className={`shrink-0 text-sm font-semibold tabular-nums ${item.status === "masuk" ? "text-signal-teal" : "text-red-400"}`}>
                {item.status === "masuk" ? "+" : "-"}{formatRupiah(item.jumlah)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}