"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/inventory/RoleGate";
import { apiFetch } from "@/lib/inventory/api";
import type { ItemLog, LogType } from "@/types/inventory";

export default function LaporanPage() {
  return (
    <RoleGate allow={["superadmin", "ketua", "divisi"]}>
      <LaporanContent />
    </RoleGate>
  );
}

function LaporanContent() {
  const [logs, setLogs] = useState<ItemLog[]>([]);
  const [type, setType] = useState<LogType | "">("");
  const [loading, setLoading] = useState(true);

  async function load(t: LogType | "") {
    setLoading(true);
    const res = await apiFetch<{ logs: ItemLog[] }>(`/api/stock/logs${t ? `?type=${t}` : ""}`);
    setLogs(res.logs);
    setLoading(false);
  }

  useEffect(() => {
    load(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-signal-cyan">Laporan</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Histori Transaksi Barang</h1>
        </div>
        <div className="flex gap-2">
          {(["", "masuk", "keluar"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                type === t
                  ? "bg-signal-violet/20 text-signal-violet"
                  : "border border-space-line text-ink-muted"
              }`}
            >
              {t === "" ? "Semua" : t === "masuk" ? "Barang Masuk" : "Barang Keluar"}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-ink-dim">Memuat...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-ink-dim">Belum ada transaksi.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-space-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-space-panel/60 text-ink-dim">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Barang</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
                <th className="px-4 py-3 font-medium">Oleh</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-space-line/60">
                  <td className="px-4 py-2.5 text-ink-muted">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2.5 text-ink">{log.items?.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={log.type === "masuk" ? "text-signal-teal" : "text-signal-gold"}>
                      {log.type === "masuk" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink">
                    {log.quantity} {log.items?.unit}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{log.note || "-"}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{log.users?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
