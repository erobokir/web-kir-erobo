"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { diklatLogoutAction } from "@/app/diklat/actions";
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

function TambahJadwalForm({
  onAdded,
}: {
  onAdded: (item: JadwalItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      nama_materi: fd.get("nama_materi"),
      tanggal_kegiatan: fd.get("tanggal_kegiatan"),
      keterangan: fd.get("keterangan"),
      pemateri: fd.get("pemateri"),
    };
    try {
      const res = await fetch("/api/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  return (
    <div className="mb-5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-signal-violet/40 bg-signal-violet/5 py-3 text-sm font-medium text-signal-violet hover:bg-signal-violet/10 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Tambah Jadwal
        </button>
      ) : (
        <div className="rounded-2xl border border-space-line bg-space-panel/80 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-signal-violet">
            Tambah Jadwal Baru
          </p>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-ink-dim">
                Nama Materi *
              </label>
              <input
                name="nama_materi"
                required
                placeholder="contoh: Pengantar Karya Tulis Ilmiah"
                className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-dim">
                Tanggal & Waktu Kegiatan *
              </label>
              <input
                name="tanggal_kegiatan"
                type="datetime-local"
                required
                className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-violet focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-dim">
                Pemateri *
              </label>
              <input
                name="pemateri"
                required
                placeholder="Nama pemateri / pembimbing"
                className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-dim">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                rows={2}
                placeholder="Tempat, info tambahan, dll."
                className="w-full resize-none rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-signal-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                className="rounded-xl border border-space-line px-4 py-2 text-sm text-ink-muted hover:text-ink"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function JadwalCard({
  item,
  isEditor,
  onDelete,
}: {
  item: JadwalItem;
  isEditor: boolean;
  onDelete: (id: string) => void;
}) {
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
        {isEditor && !passed && (
          <button
            onClick={() => {
              if (confirm("Hapus jadwal ini?")) onDelete(item.id);
            }}
            className="text-ink-dim hover:text-red-400 text-xs"
            title="Hapus"
          >
            ✕
          </button>
        )}
        {isEditor && passed && (
          <button
            onClick={() => {
              if (confirm("Hapus jadwal ini?")) onDelete(item.id);
            }}
            className="text-ink-dim hover:text-red-400 text-xs"
            title="Hapus"
          >
            ✕
          </button>
        )}
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
  isEditor,
}: {
  initialItems: JadwalItem[];
  isEditor: boolean;
}) {
  const [items, setItems] = useState<JadwalItem[]>(initialItems);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleAdded = useCallback((item: JadwalItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/jadwal?id=${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeleting(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-space bg-hex-grid px-4 py-6 text-ink">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-signal-cyan">
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

         
          <div className="mt-3 flex items-center gap-2">
            {isEditor ? (
              <form action={diklatLogoutAction}>
                <button className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
                  Keluar
                </button>
              </form>
            ) : (
              <Link
                href="/diklat/login"
                className="rounded-lg bg-signal-violet/20 px-3 py-1.5 text-xs font-medium text-signal-violet"
              >
                Login Diklat
              </Link>
            )}
          </div>
        </header>

        {isEditor && <TambahJadwalForm onAdded={handleAdded} />}

        {upcoming.length > 0 && (
          <section className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-dim">
              Akan Datang
            </p>
            <div className="space-y-3">
              {upcoming.map((item) => (
                <JadwalCard
                  key={item.id}
                  item={item}
                  isEditor={isEditor}
                  onDelete={deleting ? () => {} : handleDelete}
                />
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
                <JadwalCard
                  key={item.id}
                  item={item}
                  isEditor={isEditor}
                  onDelete={deleting ? () => {} : handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-space-line py-12 text-center">
            <p className="text-2xl">📅</p>
            <p className="mt-2 text-sm text-ink-muted">Belum ada jadwal.</p>
            {isEditor && (
              <p className="mt-1 text-xs text-ink-dim">
                Klik tombol di atas untuk menambah jadwal.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
