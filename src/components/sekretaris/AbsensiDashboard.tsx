"use client";

import { useCallback, useState } from "react";
import { sekretarisLogoutAction } from "@/app/sekretaris/actions";
import { DAFTAR_PESERTA } from "@/data/peserta";
import type { AbsenRecord, AbsensiSession, StatusAbsen } from "@/types/absensi";

const STATUS_OPTIONS: { value: StatusAbsen; label: string; color: string }[] = [
  { value: "hadir", label: "Hadir", color: "text-signal-teal" },
  { value: "izin", label: "Izin", color: "text-signal-gold" },
  { value: "sakit", label: "Sakit", color: "text-signal-cyan" },
  { value: "alpha", label: "Alpha", color: "text-red-400" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: StatusAbsen }) {
  const s = STATUS_OPTIONS.find((o) => o.value === status);
  const bg: Record<StatusAbsen, string> = {
    hadir: "bg-signal-teal/10 text-signal-teal",
    izin: "bg-signal-gold/10 text-signal-gold",
    sakit: "bg-signal-cyan/10 text-signal-cyan",
    alpha: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bg[status]}`}>
      {s?.label}
    </span>
  );
}

function FormAbsensi({ onSaved }: { onSaved: (session: AbsensiSession) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [kegiatan, setKegiatan] = useState("");
  const [records, setRecords] = useState<AbsenRecord[]>(
    DAFTAR_PESERTA.map((p) => ({
      peserta_id: p.id,
      nama: p.nama,
      kelas: p.kelas,
      divisi: p.divisi,
      status: "hadir" as StatusAbsen,
      keterangan: "",
    }))
  );
  const [filterDivisi, setFilterDivisi] = useState<string>("Semua");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setStatus(peserta_id: string, status: StatusAbsen) {
    setRecords((prev) =>
      prev.map((r) => (r.peserta_id === peserta_id ? { ...r, status } : r))
    );
  }

  function setKeterangan(peserta_id: string, keterangan: string) {
    setRecords((prev) =>
      prev.map((r) => (r.peserta_id === peserta_id ? { ...r, keterangan } : r))
    );
  }

  function setAllStatus(status: StatusAbsen) {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  }

  const divisiList = ["Semua", ...Array.from(new Set(DAFTAR_PESERTA.map((p) => p.divisi)))];
  const filtered = records.filter(
    (r) => filterDivisi === "Semua" || r.divisi === filterDivisi
  );

  const ringkasan = {
    hadir: records.filter((r) => r.status === "hadir").length,
    izin: records.filter((r) => r.status === "izin").length,
    sakit: records.filter((r) => r.status === "sakit").length,
    alpha: records.filter((r) => r.status === "alpha").length,
  };

  async function handleSimpan() {
    if (!kegiatan.trim()) { setError("Nama kegiatan wajib diisi."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal, kegiatan: kegiatan.trim(), records }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.message ?? "Gagal menyimpan.");
        return;
      }
      const { session } = await res.json();
      onSaved(session);
      setKegiatan("");
      setRecords(
        DAFTAR_PESERTA.map((p) => ({
          peserta_id: p.id,
          nama: p.nama,
          kelas: p.kelas,
          divisi: p.divisi,
          status: "hadir" as StatusAbsen,
          keterangan: "",
        }))
      );
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-signal-cyan">
        Buat Form Absensi
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Tanggal *</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-cyan focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Nama Kegiatan *</label>
          <input
            type="text"
            value={kegiatan}
            onChange={(e) => setKegiatan(e.target.value)}
            placeholder="cth. Latihan Rutin Mingguan"
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-cyan focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-dim">Filter divisi:</span>
        {divisiList.map((d) => (
          <button
            key={d}
            onClick={() => setFilterDivisi(d)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filterDivisi === d
                ? "bg-signal-cyan/20 text-signal-cyan"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {d}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setAllStatus("hadir")}
            className="rounded-lg bg-signal-teal/10 px-2.5 py-1 text-xs text-signal-teal hover:bg-signal-teal/20"
          >
            Semua Hadir
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl border border-space-line bg-space-panel2/40 p-3">
        {(["hadir", "izin", "sakit", "alpha"] as StatusAbsen[]).map((s) => (
          <div key={s} className="text-center">
            <p className={`font-display text-lg font-bold ${STATUS_OPTIONS.find((o) => o.value === s)?.color}`}>
              {ringkasan[s]}
            </p>
            <p className="text-[10px] capitalize text-ink-dim">{s}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 divide-y divide-space-line/60 rounded-xl border border-space-line overflow-hidden">
        {filtered.map((record, idx) => (
          <div key={record.peserta_id} className={`flex flex-col gap-2 p-3 sm:flex-row sm:items-center ${idx % 2 === 0 ? "bg-space-panel2/20" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{record.nama}</p>
              <p className="text-xs text-ink-dim">{record.kelas} · {record.divisi}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(record.peserta_id, opt.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      record.status === opt.value
                        ? opt.value === "hadir"
                          ? "bg-signal-teal/20 text-signal-teal"
                          : opt.value === "izin"
                            ? "bg-signal-gold/20 text-signal-gold"
                            : opt.value === "sakit"
                              ? "bg-signal-cyan/20 text-signal-cyan"
                              : "bg-red-500/20 text-red-400"
                        : "bg-space-panel2 text-ink-muted hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {record.status !== "hadir" && (
                <input
                  type="text"
                  placeholder="Keterangan"
                  value={record.keterangan ?? ""}
                  onChange={(e) => setKeterangan(record.peserta_id, e.target.value)}
                  className="w-32 rounded-lg border border-space-line bg-space-panel2 px-2 py-1 text-xs text-ink placeholder:text-ink-dim focus:border-signal-cyan focus:outline-none"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
      <button
        onClick={handleSimpan}
        disabled={loading}
        className="w-full rounded-xl bg-signal-cyan px-4 py-2.5 text-sm font-medium text-space disabled:opacity-60"
      >
        {loading ? "Menyimpan…" : "Simpan Absensi"}
      </button>
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
  onKirimGsheet,
}: {
  session: AbsensiSession;
  onDelete: (id: string) => void;
  onKirimGsheet: (id: string) => void;
}) {
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const ringkasan = {
    hadir: session.records.filter((r) => r.status === "hadir").length,
    izin: session.records.filter((r) => r.status === "izin").length,
    sakit: session.records.filter((r) => r.status === "sakit").length,
    alpha: session.records.filter((r) => r.status === "alpha").length,
  };

  async function handleKirim() {
    setSending(true);
    await onKirimGsheet(session.id);
    setSending(false);
  }

  return (
    <div className="rounded-2xl border border-space-line bg-space-panel/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{session.kegiatan}</p>
          <p className="mt-0.5 text-xs text-ink-dim">{formatDate(session.tanggal)}</p>
        </div>
        <div className="flex items-center gap-2">
          {session.dikirim_ke_gsheet ? (
            <span className="rounded-full bg-signal-teal/10 px-2.5 py-1 text-xs font-medium text-signal-teal">
              GSheet
            </span>
          ) : (
            <button
              onClick={handleKirim}
              disabled={sending}
              className="rounded-full bg-space-panel2 px-2.5 py-1 text-xs text-ink-muted hover:text-ink disabled:opacity-60"
            >
              {sending ? "Mengirim…" : "Kirim GSheet"}
            </button>
          )}
          <button
            onClick={() => confirm("Hapus sesi ini?") && onDelete(session.id)}
            className="text-xs text-ink-dim hover:text-red-400"
          >
            Hapus
          </button>
        </div>
      </div>

      <div className="my-3 grid grid-cols-4 gap-2 rounded-xl border border-space-line bg-space-panel2/40 p-2 text-center">
        <div>
          <p className="font-display text-base font-bold text-signal-teal">{ringkasan.hadir}</p>
          <p className="text-[10px] text-ink-dim">Hadir</p>
        </div>
        <div>
          <p className="font-display text-base font-bold text-signal-gold">{ringkasan.izin}</p>
          <p className="text-[10px] text-ink-dim">Izin</p>
        </div>
        <div>
          <p className="font-display text-base font-bold text-signal-cyan">{ringkasan.sakit}</p>
          <p className="text-[10px] text-ink-dim">Sakit</p>
        </div>
        <div>
          <p className="font-display text-base font-bold text-red-400">{ringkasan.alpha}</p>
          <p className="text-[10px] text-ink-dim">Alpha</p>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left text-xs text-ink-muted hover:text-ink"
      >
        {open ? "▲ Sembunyikan detail" : "▼ Lihat detail peserta"}
      </button>

      {open && (
        <div className="mt-3 divide-y divide-space-line/40 rounded-xl border border-space-line overflow-hidden">
          {session.records.map((r) => (
            <div key={r.peserta_id} className="flex items-center justify-between gap-3 px-3 py-2">
              <div>
                <p className="text-sm text-ink">{r.nama}</p>
                <p className="text-[10px] text-ink-dim">{r.kelas} · {r.divisi}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                {r.keterangan && (
                  <span className="text-xs text-ink-dim">{r.keterangan}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AbsensiDashboard({
  initialSessions,
}: {
  initialSessions: AbsensiSession[];
}) {
  const [sessions, setSessions] = useState<AbsensiSession[]>(initialSessions);
  const [tab, setTab] = useState<"buat" | "riwayat">("buat");

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  const handleSaved = useCallback((session: AbsensiSession) => {
    setSessions((prev) => [...prev, session]);
    setTab("riwayat");
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/absensi?id=${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleKirimGsheet = useCallback(async (id: string) => {
    const res = await fetch("/api/absensi/kirim-gsheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: id }),
    });
    if (res.ok) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, dikirim_ke_gsheet: true } : s))
      );
    } else {
      const j = await res.json();
      alert(j.message ?? "Gagal mengirim ke Google Sheets.");
    }
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-signal-cyan">KIR EROBO</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">Absensi</h1>
          <p className="mt-1 text-xs text-ink-dim">{sessions.length} sesi tercatat · {DAFTAR_PESERTA.length} peserta</p>
        </div>
        <form action={sekretarisLogoutAction}>
          <button className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
            Keluar
          </button>
        </form>
      </header>

      <div className="flex gap-1 rounded-xl border border-space-line bg-space-panel/40 p-1">
        {([
          { key: "buat", label: "📝 Buat Absensi" },
          { key: "riwayat", label: `📋 Riwayat (${sessions.length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-signal-cyan text-space shadow"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "buat" && <FormAbsensi onSaved={handleSaved} />}

      {tab === "riwayat" && (
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-space-line py-12 text-center">
              <p className="text-2xl">📋</p>
              <p className="mt-2 text-sm text-ink-muted">Belum ada riwayat absensi.</p>
            </div>
          ) : (
            sorted.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onDelete={handleDelete}
                onKirimGsheet={handleKirimGsheet}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}