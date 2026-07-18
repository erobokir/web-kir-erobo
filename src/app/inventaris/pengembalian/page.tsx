"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/inventory/RoleGate";
import StatusBadge from "@/components/inventory/StatusBadge";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { BorrowRequest } from "@/types/inventory";

const CONDITIONS = [
  { value: "baik", label: "Baik (stok bertambah kembali)" },
  { value: "rusak_ringan", label: "Rusak Ringan" },
  { value: "rusak_berat", label: "Rusak Berat" },
  { value: "hilang", label: "Hilang" },
];

export default function PengembalianPage() {
  return (
    <RoleGate allow={["divisi", "superadmin"]}>
      <PengembalianContent />
    </RoleGate>
  );
}

function PengembalianContent() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState({ quantity_returned: 1, condition: "baik", note: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const [handedOut, partial] = await Promise.all([
      apiFetch<{ requests: BorrowRequest[] }>("/api/borrow?status=handed_out"),
      apiFetch<{ requests: BorrowRequest[] }>("/api/borrow?status=partial_returned"),
    ]);
    setRequests([...handedOut.requests, ...partial.requests]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openForm(r: BorrowRequest) {
    setActiveId(r.id);
    setForm({ quantity_returned: r.quantity, condition: "baik", note: "" });
    setError(null);
  }

  async function submitReturn(id: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/borrow/${id}/return`, { method: "POST", body: form });
      setActiveId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mencatat pengembalian.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-signal-teal">Divisi Organisasi</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Laporan Barang Kembali</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Catat pengembalian barang yang sudah selesai dipinjam. Stok bertambah kembali jika kondisi
          barang baik.
        </p>
      </header>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-dim">Memuat...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-ink-dim">Tidak ada barang yang sedang dipinjam.</p>
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
                </div>
                <StatusBadge status={r.status} />
              </div>

              {activeId === r.id ? (
                <div className="mt-4 space-y-3 rounded-xl border border-space-line bg-space-panel2/60 p-4">
                  <label className="block">
                    <span className="mb-1 block text-xs text-ink-dim">Jumlah Dikembalikan</span>
                    <input
                      type="number"
                      min={1}
                      max={r.quantity}
                      value={form.quantity_returned}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity_returned: Number(e.target.value) }))
                      }
                      className="input"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-ink-dim">Kondisi Barang</span>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                      className="input"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-ink-dim">Catatan (opsional)</span>
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      className="input"
                      rows={2}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitReturn(r.id)}
                      disabled={busy}
                      className="rounded-lg bg-signal-teal px-4 py-2 text-sm font-medium text-space disabled:opacity-60"
                    >
                      Simpan Pengembalian
                    </button>
                    <button
                      onClick={() => setActiveId(null)}
                      className="rounded-lg border border-space-line px-4 py-2 text-sm text-ink-muted"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openForm(r)}
                  className="mt-4 rounded-lg bg-signal-teal/20 px-4 py-2 text-sm font-medium text-signal-teal"
                >
                  Catat Pengembalian
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(174, 185, 222, 0.16);
          background: #182352;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #f5f8ff;
        }
        .input:focus {
          outline: none;
          border-color: #8b6bff;
        }
      `}</style>
    </div>
  );
}
