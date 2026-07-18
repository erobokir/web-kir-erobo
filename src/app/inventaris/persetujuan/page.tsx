"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/inventory/RoleGate";
import StatusBadge from "@/components/inventory/StatusBadge";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { BorrowRequest } from "@/types/inventory";

export default function PersetujuanPage() {
  return (
    <RoleGate allow={["ketua", "superadmin"]}>
      <PersetujuanContent />
    </RoleGate>
  );
}

function PersetujuanContent() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiFetch<{ requests: BorrowRequest[] }>("/api/borrow?status=pending");
    setRequests(res.requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/api/borrow/${id}/approve`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyetujui pengajuan.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const reason = prompt("Alasan penolakan (opsional):") || undefined;
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/api/borrow/${id}/reject`, { method: "PATCH", body: { reason } });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menolak pengajuan.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-signal-gold">Ketua Ekskul</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          Persetujuan Pengajuan Barang Keluar
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Setujui atau tolak permohonan peminjaman barang dari divisi organisasi.
        </p>
      </header>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-dim">Memuat...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-ink-dim">Tidak ada pengajuan yang menunggu persetujuan. 🎉</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {r.items?.name} × {r.quantity} {r.items?.unit}
                  </p>
                  <p className="text-xs text-ink-dim">
                    Diajukan oleh {r.requester?.name} — {r.division}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{r.purpose}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => approve(r.id)}
                  disabled={busyId === r.id}
                  className="rounded-lg bg-signal-teal px-4 py-2 text-sm font-medium text-space disabled:opacity-60"
                >
                  Setujui
                </button>
                <button
                  onClick={() => reject(r.id)}
                  disabled={busyId === r.id}
                  className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 disabled:opacity-60"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
