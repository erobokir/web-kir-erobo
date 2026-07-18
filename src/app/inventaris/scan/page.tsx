"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import QrScanner from "@/components/inventory/QrScanner";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { Item } from "@/types/inventory";

export default function ScanPage() {
  const [active, setActive] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const handleResult = useCallback(
    async (decodedText: string) => {
      if (decodedText === lastCode) return; // hindari lookup berulang untuk frame yang sama
      setLastCode(decodedText);
      setActive(false);
      setError(null);
      try {
        const res = await apiFetch<{ item: Item }>(
          `/api/items/code/${encodeURIComponent(decodedText)}`,
          { auth: false }
        );
        setItem(res.item);
      } catch (err) {
        setItem(null);
        setError(
          err instanceof ApiError
            ? err.message
            : "QR tidak dikenali. Pastikan itu adalah QR barang sekretariat."
        );
      }
    },
    [lastCode]
  );

  function scanAgain() {
    setItem(null);
    setError(null);
    setLastCode(null);
    setActive(true);
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-signal-cyan">Cari Barang via QR</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Scan QR Barang</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Arahkan kamera ke stiker QR yang tertempel di barang untuk melihat detail & stok terkini.
        </p>
      </header>

      {active && <QrScanner active={active} onResult={handleResult} />}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
          <button onClick={scanAgain} className="ml-2 underline">
            Coba lagi
          </button>
        </div>
      )}

      {item && (
        <div className="rounded-2xl border border-space-line bg-space-panel/60 p-5">
          <p className="font-mono text-xs text-signal-cyan">{item.code}</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink">{item.name}</h2>
          <dl className="mt-3 space-y-1 text-sm text-ink-muted">
            <div className="flex justify-between">
              <dt>Kategori</dt>
              <dd className="text-ink">{item.category || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Stok tersedia</dt>
              <dd className={item.quantity <= item.min_stock ? "text-signal-gold" : "text-ink"}>
                {item.quantity} {item.unit}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Lokasi</dt>
              <dd className="text-ink">{item.location || "-"}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/inventaris/barang/${item.id}`}
              className="rounded-lg bg-signal-violet/20 px-3 py-2 text-xs font-medium text-signal-violet"
            >
              Lihat Detail & Histori
            </Link>
            <Link
              href={`/inventaris/masuk?item=${item.id}`}
              className="rounded-lg border border-space-line px-3 py-2 text-xs text-ink-muted hover:text-ink"
            >
              Catat Barang Masuk
            </Link>
            <Link
              href={`/inventaris/keluar?item=${item.id}`}
              className="rounded-lg border border-space-line px-3 py-2 text-xs text-ink-muted hover:text-ink"
            >
              Ajukan Peminjaman
            </Link>
            <button
              onClick={scanAgain}
              className="rounded-lg border border-space-line px-3 py-2 text-xs text-ink-muted hover:text-ink"
            >
              Scan Barang Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
