"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/inventory/RoleGate";
import StatusBadge from "@/components/inventory/StatusBadge";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { BorrowRequest } from "@/types/inventory";

export default function SerahTerimaPage() {
  return (
    <RoleGate allow={["divisi", "superadmin"]}>
      <SerahTerimaContent />
    </RoleGate>
  );
}

function SerahTerimaContent() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiFetch<{ requests: BorrowRequest[] }>("/api/borrow?status=approved");
    setRequests(res.requests);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handover(id: string) {
    if (!confirm("Konfirmasi barang sudah diserahkan secara fisik ke peminjam?")) return;
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/api/borrow/${id}/handover`, { method: "PATCH" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mencatat serah terima.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-signal-violet">Divisi Organisasi</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Serah Terima Barang Keluar</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Daftar pengajuan yang sudah di-ACC ketua ekskul dan siap diserahkan. Stok akan otomatis
          berkurang setelah dikonfirmasi di sini.
        </p>
      </header>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-dim">Memuat...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-ink-dim">Tidak ada barang yang menunggu diserahkan.</p>
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
                    Peminjam: {r.requester?.name} — {r.division}
                  </p>
                  <p className="text-xs text-ink-dim">Disetujui oleh {r.approver?.name}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <button
                onClick={() => handover(r.id)}
                disabled={busyId === r.id}
                className="mt-4 rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                Konfirmasi Barang Diserahkan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
