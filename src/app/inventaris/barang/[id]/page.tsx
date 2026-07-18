"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import type { Item, ItemLog } from "@/types/inventory";

export default function BarangDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useInventoryAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [logs, setLogs] = useState<ItemLog[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch<{ item: Item }>(`/api/items/${id}`, { auth: false });
      setItem(res.item);
      const logRes = await apiFetch<{ logs: ItemLog[] }>(`/api/items/${id}/logs`);
      setLogs(logRes.logs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data barang.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadQr() {
    try {
      const res = await apiFetch<{ qrDataUrl: string }>(`/api/items/${id}/qrcode`);
      setQr(res.qrDataUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat QR.");
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus barang ini beserta semua histori terkait?")) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/items/${id}`, { method: "DELETE" });
      window.location.href = "/inventaris/barang";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus barang.");
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-dim">Memuat...</p>;
  if (error && !item) return <p className="text-sm text-red-400">{error}</p>;
  if (!item) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <header>
          <Link href="/inventaris/barang" className="text-xs text-ink-dim hover:text-ink">
            Kembali ke katalog
          </Link>
          <p className="mt-2 font-mono text-xs text-signal-cyan">{item.code}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{item.name}</h1>
        </header>

        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-space-line bg-space-panel/60 p-5 text-sm sm:grid-cols-3">
          <Info label="Kategori" value={item.category || "-"} />
          <Info
            label="Stok Tersedia"
            value={`${item.quantity} ${item.unit}`}
            warn={item.quantity <= item.min_stock}
          />
          <Info label="Batas Minimum" value={`${item.min_stock} ${item.unit}`} />
          <Info label="Lokasi" value={item.location || "-"} />
          {item.description && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-ink-dim">Deskripsi</p>
              <p className="text-ink">{item.description}</p>
            </div>
          )}
        </dl>

        {user?.role === "superadmin" && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
            >
              {deleting ? "Menghapus..." : "Hapus Barang"}
            </button>
          </div>
        )}

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Histori Transaksi</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-ink-dim">Belum ada histori.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl border border-space-line bg-space-panel/40 px-4 py-2.5 text-sm"
                >
                  <div>
                    <span
                      className={
                        log.type === "masuk" ? "text-signal-teal" : "text-signal-gold"
                      }
                    >
                      {log.type === "masuk" ? "▲ Masuk" : "▼ Keluar"}
                    </span>{" "}
                    <span className="text-ink">{log.quantity} {item.unit}</span>
                    {log.note && <p className="text-xs text-ink-dim">{log.note}</p>}
                  </div>
                  <div className="text-right text-xs text-ink-dim">
                    <p>{log.users?.name || "-"}</p>
                    <p>{new Date(log.created_at).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-space-line bg-space-panel/60 p-5 text-center">
          <p className="mb-3 text-sm font-medium text-ink">QR Barang</p>
          {qr ? (
            <img src={qr} alt={`QR ${item.code}`} className="mx-auto w-44 rounded-lg bg-white p-2" />
          ) : user?.role === "superadmin" ? (
            <button
              onClick={loadQr}
              className="rounded-lg bg-signal-violet/20 px-3 py-2 text-xs font-medium text-signal-violet"
            >
              Tampilkan QR untuk dicetak
            </button>
          ) : (
            <p className="text-xs text-ink-dim">Hanya superadmin yang bisa mencetak QR.</p>
          )}
        </div>

        <div className="rounded-2xl border border-space-line bg-space-panel/60 p-5 text-sm">
          <p className="mb-2 font-medium text-ink">Aksi Cepat</p>
          <div className="flex flex-col gap-2">
            <Link href={`/inventaris/masuk?item=${item.id}`} className="text-signal-cyan hover:underline">
              Catat Barang Masuk
            </Link>
            <Link href={`/inventaris/keluar?item=${item.id}`} className="text-signal-cyan hover:underline">
              Ajukan Peminjaman
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-xs text-ink-dim">{label}</p>
      <p className={warn ? "font-semibold text-signal-gold" : "text-ink"}>{value}</p>
    </div>
  );
}
