"use client";

import { useState } from "react";
import Link from "next/link";
import RoleGate from "@/components/inventory/RoleGate";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { Item } from "@/types/inventory";

export default function TambahBarangPage() {
  return (
    <RoleGate allow={["superadmin", "divisi"]}>
      <TambahBarangForm />
    </RoleGate>
  );
}

function TambahBarangForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "pcs",
    quantity: 0,
    min_stock: 1,
    location: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ item: Item; qrDataUrl: string } | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ item: Item; qrDataUrl: string }>("/api/items", {
        method: "POST",
        body: form,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menambah barang.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-sm space-y-4 text-center">
        <p className="text-sm text-ink-muted">Barang berhasil ditambahkan!</p>
        <h1 className="font-display text-xl font-semibold text-ink">{result.item.name}</h1>
        <p className="font-mono text-xs text-signal-cyan">{result.item.code}</p>
        <img
          src={result.qrDataUrl}
          alt={`QR ${result.item.code}`}
          className="mx-auto w-52 rounded-xl border border-space-line bg-white p-3"
        />
        <p className="text-xs text-ink-dim">
          Cetak &amp; tempelkan QR ini di barang fisik. QR ini yang akan dipakai saat scan cari/tambah barang.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Link
            href={`/inventaris/barang/${result.item.id}`}
            className="rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white"
          >
            Lihat Detail Barang
          </Link>
          <button
            onClick={() => setResult(null)}
            className="rounded-lg border border-space-line px-4 py-2 text-sm text-ink-muted"
          >
            Tambah Barang Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <Link
          href="/inventaris"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          Kembali
        </Link>
        <p className="text-xs uppercase tracking-widest text-signal-cyan">DAFTAR BARANG</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Tambah Barang Baru</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Kode unik &amp; QR code akan diterbitkan otomatis setelah barang disimpan.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama Barang">
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="input"
              placeholder="Elektronik, ATK, dll"
            />
          </Field>
          <Field label="Satuan">
            <input
              value={form.unit}
              onChange={(e) => update("unit", e.target.value)}
              className="input"
              placeholder="pcs, unit, box"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stok Awal">
            <input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => update("quantity", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Batas Stok Minimum">
            <input
              type="number"
              min={0}
              value={form.min_stock}
              onChange={(e) => update("min_stock", Number(e.target.value))}
              className="input"
            />
          </Field>
        </div>
        <Field label="Lokasi Penyimpanan">
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className="input"
            placeholder="Lemari A, Rak 2"
          />
        </Field>
        <Field label="Deskripsi (opsional)">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-signal-violet px-4 py-2.5 text-sm font-medium text-white shadow-glow disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan & Terbitkan QR"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-dim">{label}</span>
      {children}
    </label>
  );
}