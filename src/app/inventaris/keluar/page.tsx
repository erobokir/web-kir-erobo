"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RoleGate from "@/components/inventory/RoleGate";
import StatusBadge from "@/components/inventory/StatusBadge";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import type { BorrowRequest, Item } from "@/types/inventory";

export default function AjukanPeminjamanPage() {
  return (
    <RoleGate allow={["divisi", "superadmin"]}>
      <Suspense fallback={<p className="text-sm text-ink-dim">Memuat...</p>}>
        <AjukanPeminjamanContent />
      </Suspense>
    </RoleGate>
  );
}

function AjukanPeminjamanContent() {
  const { user } = useInventoryAuth();
  const searchParams = useSearchParams();
  const preselectedItem = searchParams.get("item") || "";

  const [items, setItems] = useState<Item[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [form, setForm] = useState({
    item_id: preselectedItem,
    quantity: 1,
    division: user?.division || "",
    purpose: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    const res = await apiFetch<{ requests: BorrowRequest[] }>("/api/borrow");
    setRequests(res.requests);
  }

  useEffect(() => {
    apiFetch<{ items: Item[] }>("/api/items", { auth: false }).then((res) => setItems(res.items));
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.item_id) {
      setError("Pilih barang terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/borrow", { method: "POST", body: form });
      setSuccess("Pengajuan peminjaman berhasil dikirim, menunggu ACC ketua ekskul.");
      setForm((f) => ({ ...f, quantity: 1, purpose: "" }));
      loadRequests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengirim pengajuan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <header>
          <p className="text-xs uppercase tracking-widest text-signal-gold">Pengajuan</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Ajukan Peminjaman Barang
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Pengajuan akan diteruskan ke ketua ekskul untuk di-ACC sebelum barang bisa diserahkan.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Barang</span>
            <select
              required
              value={form.item_id}
              onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))}
              className="input"
            >
              <option value="">-- Pilih barang --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code}) — stok {item.quantity} {item.unit}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Jumlah</span>
            <input
              type="number"
              min={1}
              required
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
              className="input"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Divisi Peminjam</span>
            <input
              required
              value={form.division}
              onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
              className="input"
              placeholder="Divisi Organisasi"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Keperluan</span>
            <textarea
              required
              value={form.purpose}
              onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              className="input"
              rows={3}
              placeholder="Contoh: dipakai untuk lomba LKTI tanggal ..."
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-signal-teal">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-signal-gold px-4 py-2.5 text-sm font-medium text-space disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Pengajuan Saya</h2>
        <div className="space-y-2">
          {requests.length === 0 && <p className="text-sm text-ink-dim">Belum ada pengajuan.</p>}
          {requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-space-line bg-space-panel/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {r.items?.name} × {r.quantity}
                  </p>
                  <p className="text-xs text-ink-dim">{r.purpose}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.status === "rejected" && r.rejection_reason && (
                <p className="mt-2 text-xs text-red-400">Alasan ditolak: {r.rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      </div>

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
