"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { JadwalItem } from "@/types/jadwal";

function getCountdown(targetISO: string) {
  const diff = new Date(targetISO).getTime() - Date.now();
  if (diff <= 0) return { label: "Selesai", urgent: false, passed: true };
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const label =
    days > 0
      ? `${days}h ${hours}j`
      : hours > 0
        ? `${hours}j ${minutes}m`
        : `${minutes}m ${seconds}d`;
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
    return <span className="text-xs text-ink-dim">Sudah selesai</span>;
  return (
    <span
      className={`font-mono text-xs font-semibold tabular-nums ${cd.urgent ? "text-signal-gold" : "text-signal-cyan"}`}
    >
      ⏱ {cd.label}
    </span>
  );
}

function TambahJadwalForm({ onAdded }: { onAdded: (item: JadwalItem) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_materi: fd.get("nama_materi"),
          tanggal_kegiatan: fd.get("tanggal_kegiatan"),
          keterangan: fd.get("keterangan"),
          pemateri: fd.get("pemateri"),
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.message ?? "Gagal menyimpan.");
        return;
      }
      const { item } = await res.json();
      onAdded(item);
      formRef.current?.reset();
      setOpen(false);
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-signal-violet/40 bg-signal-violet/5 py-3 text-sm font-medium text-signal-violet hover:bg-signal-violet/10 transition-colors"
      >
        <span className="text-base leading-none">+</span> Tambah Jadwal
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-signal-violet/30 bg-space-panel2/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-signal-violet">
          Tambah Jadwal Baru
        </p>
        <button
          onClick={() => { setOpen(false); setError(""); }}
          className="text-ink-dim hover:text-ink text-sm"
        >
          ✕
        </button>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Nama Materi *</label>
          <input
            name="nama_materi"
            required
            placeholder="cth. Pengantar Karya Tulis Ilmiah"
            className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ink-dim">Tanggal & Waktu *</label>
            <input
              name="tanggal_kegiatan"
              type="datetime-local"
              required
              className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-violet focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-dim">Pemateri *</label>
            <input
              name="pemateri"
              required
              placeholder="Nama pemateri"
              className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Keterangan</label>
          <textarea
            name="keterangan"
            rows={2}
            placeholder="Lokasi, info tambahan, dll."
            className="w-full resize-none rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Menyimpan…" : "Simpan Jadwal"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(""); }}
            className="rounded-lg border border-space-line px-4 py-2 text-sm text-ink-muted hover:text-ink"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

function JadwalCard({
  item,
  onDelete,
}: {
  item: JadwalItem;
  onDelete: (id: string) => void;
}) {
  const passed = new Date(item.tanggal_kegiatan).getTime() <= Date.now();
  return (
    <div
      className={`rounded-xl border p-3 transition-all ${passed ? "border-space-line opacity-60" : "border-space-line hover:border-signal-violet/30 bg-space-panel/50"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{item.nama_materi}</p>
          <p className="mt-0.5 text-xs text-ink-dim">{formatDate(item.tanggal_kegiatan)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <CountdownTicker targetISO={item.tanggal_kegiatan} />
          <button
            onClick={() => confirm("Hapus jadwal ini?") && onDelete(item.id)}
            className="text-[10px] text-ink-dim hover:text-red-400"
          >
            Hapus
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-space-line/60 pt-2">
        <span className="text-xs text-ink-muted">
          <span className="text-ink-dim">👤</span> {item.pemateri}
        </span>
        {item.keterangan && (
          <span className="text-xs text-ink-dim">
            📌 {item.keterangan}
          </span>
        )}
      </div>
    </div>
  );
}

export default function JadwalPanel() {
  const [items, setItems] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetch("/api/jadwal")
      .then((r) => r.json())
      .then(({ jadwal }) => {
        setItems(jadwal?.items ?? []);
      })
      .catch(() => setFetchError("Gagal memuat jadwal."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdded = useCallback((item: JadwalItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/jadwal?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const sorted = [...items].sort((a, b) => {
    const aT = new Date(a.tanggal_kegiatan).getTime();
    const bT = new Date(b.tanggal_kegiatan).getTime();
    const now = Date.now();
    if (aT > now && bT <= now) return -1;
    if (aT <= now && bT > now) return 1;
    return aT > now ? aT - bT : bT - aT;
  });

  const upcoming = sorted.filter((i) => new Date(i.tanggal_kegiatan).getTime() > Date.now());
  const past = sorted.filter((i) => new Date(i.tanggal_kegiatan).getTime() <= Date.now());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-dim">Kelola jadwal kegiatan diklat</p>
        </div>
        <Link
          href="/jadwal"
          target="_blank"
          className="rounded-lg bg-space-panel2 px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
        >
          Lihat publik ↗
        </Link>
      </div>

      <TambahJadwalForm onAdded={handleAdded} />

      {loading && (
        <p className="py-4 text-center text-xs text-ink-dim">Memuat jadwal…</p>
      )}
      {fetchError && (
        <p className="text-xs text-red-400">{fetchError}</p>
      )}

      {!loading && upcoming.length > 0 && (
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
            Akan Datang ({upcoming.length})
          </p>
          <div className="space-y-2">
            {upcoming.map((item) => (
              <JadwalCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {!loading && past.length > 0 && (
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
            Sudah Berlangsung ({past.length})
          </p>
          <div className="space-y-2">
            {past.map((item) => (
              <JadwalCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {!loading && items.length === 0 && !fetchError && (
        <div className="rounded-xl border border-dashed border-space-line py-10 text-center">
          <p className="text-xl">📅</p>
          <p className="mt-1 text-sm text-ink-muted">Belum ada jadwal.</p>
          <p className="text-xs text-ink-dim">Tambah jadwal pertama di atas.</p>
        </div>
      )}
    </div>
  );
}
