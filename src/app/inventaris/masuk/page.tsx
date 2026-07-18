"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RoleGate from "@/components/inventory/RoleGate";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { Item } from "@/types/inventory";

export default function BarangMasukPage() {
  return (
    <RoleGate allow={["superadmin", "divisi"]}>
      <Suspense fallback={<p className="text-sm text-ink-dim">Memuat...</p>}>
        <BarangMasukForm />
      </Suspense>
    </RoleGate>
  );
}

function BarangMasukForm() {
  const searchParams = useSearchParams();
  const preselectedItem = searchParams.get("item") || "";

  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState(preselectedItem);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ items: Item[] }>("/api/items", { auth: false }).then((res) => setItems(res.items));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!itemId) {
      setError("Pilih barang terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ item: Item }>("/api/stock/masuk", {
        method: "POST",
        body: { item_id: itemId, quantity, note },
      });
      setSuccess(`Berhasil! Stok "${res.item.name}" sekarang ${res.item.quantity} ${res.item.unit}.`);
      setQuantity(1);
      setNote("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mencatat barang masuk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-signal-teal">Pendataan</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Catat Barang Masuk</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Gunakan untuk restock barang lama (bukan barang baru). Untuk barang baru, tambahkan lewat
          menu Katalog Barang.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-dim">Barang</span>
          <select
            required
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
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
          <span className="mb-1 block text-xs text-ink-dim">Jumlah Masuk</span>
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-ink-dim">Catatan (opsional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input" rows={3} />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-signal-teal">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-signal-teal px-4 py-2.5 text-sm font-medium text-space shadow-glow-cyan disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Barang Masuk"}
        </button>
      </form>

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
