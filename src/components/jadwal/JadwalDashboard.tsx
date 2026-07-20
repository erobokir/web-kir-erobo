"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JadwalItem } from "@/types/jadwal";

function getCountdown(targetISO: string): {
  label: string;
  urgent: boolean;
  passed: boolean;
} {
  const diff = new Date(targetISO).getTime() - Date.now();
  if (diff <= 0) return { label: "Selesai", urgent: false, passed: true };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let label = "";
  if (days > 0) label = `${days}h ${hours}j`;
  else if (hours > 0) label = `${hours}j ${minutes}m`;
  else label = `${minutes}m ${seconds}d`;

  return { label, urgent: diff < 24 * 60 * 60 * 1000, passed: false };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CountdownTicker({ targetISO }: { targetISO: string }) {
  const [cd, setCd] = useState(() => getCountdown(targetISO));
  useEffect(() => {
    if (cd.passed) return;
    const t = setInterval(() => setCd(getCountdown(targetISO)), 1000);
    return () => clearInterval(t);
  }, [targetISO, cd.passed]);

  if (cd.passed)
    return (
      <span className="text-xs font-medium text-ink-dim">Sudah selesai</span>
    );
  return (
    <span
      className={`font-mono text-sm font-semibold tabular-nums ${cd.urgent ? "text-signal-gold" : "text-signal-cyan"}`}
    >
      ⏱ {cd.label}
    </span>
  );
}

function JadwalCard({ item }: { item: JadwalItem }) {
  const passed = new Date(item.tanggal_kegiatan).getTime() <= Date.now();

  return (
    <div
      className={`relative rounded-2xl border bg-space-panel/70 p-4 transition-all ${
        passed
          ? "border-space-line opacity-60"
          : "border-space-line hover:border-signal-violet/40"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <CountdownTicker targetISO={item.tanggal_kegiatan} />
      </div>

      <h3 className="text-base font-semibold text-ink leading-snug">
        {item.nama_materi}
      </h3>

      <p className="mt-1 text-xs text-ink-dim">{formatDate(item.tanggal_kegiatan)}</p>

      <div className="my-3 h-px bg-space-line" />

      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal-violet/20 text-xs text-signal-violet">
          👤
        </span>
        <span className="text-sm text-ink-muted">{item.pemateri}</span>
      </div>

      {item.keterangan && (
        <p className="mt-2 text-xs leading-relaxed text-ink-dim">
          📌 {item.keterangan}
        </p>
      )}
    </div>
  );
}

export default function JadwalDashboard({
  initialItems,
}: {
  initialItems: JadwalItem[];
}) {
  const [items] = useState<JadwalItem[]>(initialItems);

  const sorted = [...items].sort((a, b) => {
    const aT = new Date(a.tanggal_kegiatan).getTime();
    const bT = new Date(b.tanggal_kegiatan).getTime();
    const now = Date.now();
    const aFuture = aT > now;
    const bFuture = bT > now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return aFuture ? aT - bT : bT - aT;
  });

  const upcoming = sorted.filter((i) => new Date(i.tanggal_kegiatan).getTime() > Date.now());
  const past = sorted.filter((i) => new Date(i.tanggal_kegiatan).getTime() <= Date.now());

  return (
    <div className="min-h-screen bg-space bg-hex-grid px-4 py-6 text-ink">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <a
            href="/"
            className="rounded-lg border border-space-line px-1.5 py-1.5 text-xs text-ink-muted hover:text-ink"
          >
            Kembali
          </a>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-signal-cyan">
            KIR EROBO
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">
            Jadwal Kegiatan
          </h1>
          <p className="mt-1 text-xs text-ink-dim">
            {upcoming.length > 0
              ? `${upcoming.length} kegiatan akan datang`
              : "Belum ada kegiatan mendatang"}
          </p>
        </header>

        {upcoming.length > 0 && (
          <section className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-dim">
              Akan Datang
            </p>
            <div className="space-y-3">
              {upcoming.map((item) => (
                <JadwalCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-dim">
              Sudah Berlangsung
            </p>
            <div className="space-y-3">
              {past.map((item) => (
                <JadwalCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-space-line py-12 text-center">
            <p className="text-2xl">📅</p>
            <p className="mt-2 text-sm text-ink-muted">Belum ada jadwal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
