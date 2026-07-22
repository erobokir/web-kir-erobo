"use client";

import { useCallback, useEffect, useState } from "react";
import { DAFTAR_PESERTA } from "@/data/peserta";
import type { KasRecord, KasSession, KasSummary } from "@/types/keuangan";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function calcKasSummary(sessions: KasSession[]): KasSummary {
  let total_lunas = 0;
  let total_belum = 0;
  let total_terkumpul = 0;
  for (const s of sessions) {
    for (const r of s.records) {
      if (r.status === "lunas") { total_lunas++; total_terkumpul += r.jumlah; }
      else total_belum++;
    }
  }
  return { total_lunas, total_belum, total_terkumpul, total_sessions: sessions.length };
}

function BuatSessionForm({ onCreated }: { onCreated: (s: KasSession) => void }) {
  const [open, setOpen] = useState(false);
  const [periode, setPeriode] = useState("");
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!periode.trim() || !nominal) { setError("Semua field wajib diisi."); return; }
    setError("");
    setLoading(true);

    const records: KasRecord[] = DAFTAR_PESERTA.map((p) => ({
      peserta_id: p.id,
      nama: p.nama,
      kelas: p.kelas,
      divisi: p.divisi,
      status: "belum" as const,
      jumlah: 0,
    }));

    try {
      const res = await fetch("/api/kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periode: periode.trim(), nominal_per_orang: Number(nominal), records }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.message ?? "Gagal."); return; }
      const { session } = await res.json();
      onCreated(session);
      setPeriode("");
      setNominal("");
      setOpen(false);
    } catch { setError("Terjadi kesalahan."); }
    finally { setLoading(false); }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-signal-violet/40 bg-signal-violet/5 py-3 text-sm font-medium text-signal-violet hover:bg-signal-violet/10 transition-colors"
      >
        <span className="text-base leading-none">+</span> Buat Periode Kas Baru
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-signal-violet/30 bg-space-panel/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-signal-violet">Periode Kas Baru</p>
        <button onClick={() => { setOpen(false); setError(""); }} className="text-ink-dim hover:text-ink text-sm">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Nama Periode *</label>
          <input
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            placeholder="cth. Kas Minggu ke-1 Juli 2026"
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Nominal per Orang (Rp) *</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            min="1"
            placeholder="5000"
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-violet focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-signal-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Membuat…" : "Buat Periode"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(""); }}
            className="rounded-xl border border-space-line px-4 py-2 text-sm text-ink-muted hover:text-ink"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

function KasSessionCard({
  session,
  onDelete,
  onUpdateRecord,
}: {
  session: KasSession;
  onDelete: (id: string) => void;
  onUpdateRecord: (session_id: string, peserta_id: string, status: KasRecord["status"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"semua" | "lunas" | "belum">("semua");

  const lunas = session.records.filter((r) => r.status === "lunas").length;
  const belum = session.records.filter((r) => r.status === "belum").length;
  const terkumpul = session.records.filter((r) => r.status === "lunas").reduce((a, r) => a + r.jumlah, 0);

  const filtered =
    filter === "semua" ? session.records : session.records.filter((r) => r.status === filter);

  return (
    <div className="rounded-2xl border border-space-line bg-space-panel/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{session.periode}</p>
          <p className="mt-0.5 text-xs text-ink-dim">
            {formatRupiah(session.nominal_per_orang)}/orang · {formatDate(session.created_at)}
          </p>
        </div>
        <button
          onClick={() => confirm("Hapus periode kas ini?") && onDelete(session.id)}
          className="text-xs text-ink-dim hover:text-red-400"
        >
          Hapus
        </button>
      </div>

      <div className="my-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-space-line bg-space-panel2/50 p-2.5 text-center">
          <p className="font-display text-base font-bold text-signal-teal">{lunas}</p>
          <p className="text-[10px] text-ink-dim">Lunas</p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/50 p-2.5 text-center">
          <p className="font-display text-base font-bold text-signal-gold">{belum}</p>
          <p className="text-[10px] text-ink-dim">Belum</p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/50 p-2.5 text-center">
          <p className="font-display text-sm font-bold text-signal-cyan">{formatRupiah(terkumpul)}</p>
          <p className="text-[10px] text-ink-dim">Terkumpul</p>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 w-full text-left text-xs text-ink-muted hover:text-ink"
      >
        {open ? "▲ Sembunyikan" : "▼ Kelola pembayaran"}
      </button>

      {open && (
        <>
          <div className="mb-3 flex gap-1">
            {(["semua", "lunas", "belum"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f ? "bg-signal-violet/20 text-signal-violet" : "text-ink-muted hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="divide-y divide-space-line/50 rounded-xl border border-space-line overflow-hidden">
            {filtered.map((r) => (
              <div key={r.peserta_id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{r.nama}</p>
                  <p className="text-[10px] text-ink-dim">{r.kelas} · {r.divisi}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.status === "lunas" && r.tanggal_bayar && (
                    <span className="text-[10px] text-ink-dim">{formatDate(r.tanggal_bayar)}</span>
                  )}
                  <button
                    onClick={() => onUpdateRecord(
                      session.id,
                      r.peserta_id,
                      r.status === "lunas" ? "belum" : "lunas"
                    )}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      r.status === "lunas"
                        ? "bg-signal-teal/15 text-signal-teal hover:bg-signal-teal/25"
                        : "bg-signal-gold/15 text-signal-gold hover:bg-signal-gold/25"
                    }`}
                  >
                    {r.status === "lunas" ? "✓ Lunas" : "Belum"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function KasPanel() {
  const [sessions, setSessions] = useState<KasSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kas")
      .then((r) => r.json())
      .then(({ kas }) => setSessions(kas?.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const summary = calcKasSummary(sessions);

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleCreated = useCallback((s: KasSession) => {
    setSessions((prev) => [...prev, s]);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/kas?id=${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleUpdateRecord = useCallback(async (
    session_id: string,
    peserta_id: string,
    status: KasRecord["status"]
  ) => {
    const res = await fetch("/api/kas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id,
        peserta_id,
        status,
        tanggal_bayar: status === "lunas" ? new Date().toISOString() : undefined,
      }),
    });
    if (res.ok) {
      const { kas } = await res.json();
      setSessions(kas.sessions);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Terkumpul</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-teal">
            {loading ? "—" : formatRupiah(summary.total_terkumpul)}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Lunas</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-cyan">
            {loading ? "—" : summary.total_lunas}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Belum Bayar</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-gold">
            {loading ? "—" : summary.total_belum}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Periode</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-violet">
            {loading ? "—" : summary.total_sessions}
          </p>
        </div>
      </div>

      <BuatSessionForm onCreated={handleCreated} />

      {loading && <p className="py-4 text-center text-xs text-ink-dim">Memuat data kas…</p>}

      {!loading && sorted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-space-line py-10 text-center">
          <p className="text-xl">💰</p>
          <p className="mt-1 text-sm text-ink-muted">Belum ada periode kas.</p>
        </div>
      )}

      {!loading && sorted.map((s) => (
        <KasSessionCard
          key={s.id}
          session={s}
          onDelete={handleDelete}
          onUpdateRecord={handleUpdateRecord}
        />
      ))}
    </div>
  );
}