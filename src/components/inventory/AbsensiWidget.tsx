"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AbsensiSession } from "@/types/absensi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AbsensiWidget() {
  const [sessions, setSessions] = useState<AbsensiSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/absensi")
      .then((r) => r.json())
      .then(({ absensi }) => setSessions(absensi?.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  const latest = sorted[0] ?? null;

  const totalHadir = sessions.reduce(
    (acc, s) => acc + s.records.filter((r) => r.status === "hadir").length, 0
  );
  const totalAlpha = sessions.reduce(
    (acc, s) => acc + s.records.filter((r) => r.status === "alpha").length, 0
  );

  return (
    <section className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Absensi</h2>
          <p className="text-xs text-ink-dim">Laporan dari sekretaris</p>
        </div>
        <Link
          href="/sekretaris"
          className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          Lihat semua ↗
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Total Sesi</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-cyan">
            {loading ? "—" : sessions.length}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Total Hadir</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-teal">
            {loading ? "—" : totalHadir}
          </p>
        </div>
        <div className="rounded-xl border border-space-line bg-space-panel2/60 p-3">
          <p className="text-[10px] text-ink-dim">Total Alpha</p>
          <p className="mt-0.5 font-display text-base font-semibold text-signal-gold">
            {loading ? "—" : totalAlpha}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-ink-dim">Memuat data absensi…</p>
      ) : !latest ? (
        <p className="text-xs text-ink-dim">Belum ada data absensi.</p>
      ) : (
        <div className="rounded-xl border border-space-line bg-space-panel2/30 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{latest.kegiatan}</p>
              <p className="text-xs text-ink-dim">{formatDate(latest.tanggal)}</p>
            </div>
            {latest.dikirim_ke_gsheet && (
              <span className="rounded-full bg-signal-teal/10 px-2 py-0.5 text-[10px] font-medium text-signal-teal">
                ✓ GSheet
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {(["hadir", "izin", "sakit", "alpha"] as const).map((s) => {
              const count = latest.records.filter((r) => r.status === s).length;
              const colors = {
                hadir: "text-signal-teal",
                izin: "text-signal-gold",
                sakit: "text-signal-cyan",
                alpha: "text-red-400",
              };
              return (
                <div key={s} className="rounded-lg border border-space-line bg-space-panel2/50 p-2">
                  <p className={`font-display text-base font-bold ${colors[s]}`}>{count}</p>
                  <p className="text-[10px] capitalize text-ink-dim">{s}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-dim">
              Tidak Hadir
            </p>
            <div className="space-y-1">
              {latest.records
                .filter((r) => r.status !== "hadir")
                .slice(0, 5)
                .map((r) => (
                  <div key={r.peserta_id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-ink">{r.nama}</p>
                      <p className="text-[10px] text-ink-dim">{r.kelas} · {r.jurusan ?? ""} · {r.divisi}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                      r.status === "izin"
                        ? "bg-signal-gold/10 text-signal-gold"
                        : r.status === "sakit"
                          ? "bg-signal-cyan/10 text-signal-cyan"
                          : "bg-red-500/10 text-red-400"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              {latest.records.filter((r) => r.status !== "hadir").length > 5 && (
                <p className="text-[10px] text-ink-dim">
                  +{latest.records.filter((r) => r.status !== "hadir").length - 5} lainnya
                </p>
              )}
              {latest.records.filter((r) => r.status !== "hadir").length === 0 && (
                <p className="text-[10px] text-signal-teal">Semua peserta hadir 🎉</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}