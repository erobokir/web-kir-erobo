"use client";

import { useCallback, useRef, useState } from "react";
import { bendaharaLogoutAction } from "@/app/bendahara/actions";
import KasPanel from "./KasPanel";
import type { KeuanganItem, KeuanganSummary } from "@/types/keuangan";

type ActiveTab = "transaksi" | "kas";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcSummary(items: KeuanganItem[]): KeuanganSummary {
  let total_masuk = 0;
  let total_keluar = 0;
  for (const item of items) {
    if (item.status === "masuk") total_masuk += item.jumlah;
    else total_keluar += item.jumlah;
  }
  return { total_masuk, total_keluar, saldo: total_masuk - total_keluar, total_transaksi: items.length };
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: "teal" | "gold" | "violet" | "cyan" }) {
  const colors = { teal: "text-signal-teal", gold: "text-signal-gold", violet: "text-signal-violet", cyan: "text-signal-cyan" };
  return (
    <div className="rounded-2xl border border-space-line bg-space-panel/60 p-4">
      <p className="text-xs text-ink-dim">{label}</p>
      <p className={`mt-1 font-display text-lg font-semibold ${colors[accent]}`}>{value}</p>
    </div>
  );
}

function TambahForm({ onAdded }: { onAdded: (item: KeuanganItem) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const jumlah = parseFloat(String(fd.get("jumlah")).replace(/\./g, "").replace(",", "."));
    try {
      const res = await fetch("/api/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keperluan: fd.get("keperluan"),
          status: fd.get("status"),
          jumlah,
          timestamp: fd.get("timestamp"),
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.message ?? "Gagal menyimpan.");
        return;
      }
      const { item } = await res.json();
      onAdded(item);
      formRef.current?.reset();
      setOpen(false);
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-signal-gold/40 bg-signal-gold/5 py-3 text-sm font-medium text-signal-gold hover:bg-signal-gold/10 transition-colors"
      >
        <span className="text-base leading-none">+</span> Tambah Transaksi
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-signal-gold/30 bg-space-panel/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-signal-gold">Tambah Transaksi</p>
        <button onClick={() => { setOpen(false); setError(""); }} className="text-ink-dim hover:text-ink text-sm">✕</button>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Keperluan *</label>
          <input
            name="keperluan"
            required
            placeholder="cth. Pembelian kertas A4"
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-gold focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ink-dim">Status *</label>
            <select
              name="status"
              required
              defaultValue=""
              className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-gold focus:outline-none"
            >
              <option value="" disabled>Pilih...</option>
              <option value="masuk">💰 Masuk</option>
              <option value="keluar">💸 Keluar</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-dim">Jumlah (Rp) *</label>
            <input
              name="jumlah"
              type="number"
              required
              min="1"
              placeholder="0"
              className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-gold focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Tanggal & Waktu *</label>
          <input
            name="timestamp"
            type="datetime-local"
            required
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-gold focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-signal-gold px-4 py-2 text-sm font-medium text-space disabled:opacity-60"
          >
            {loading ? "Menyimpan…" : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(""); }}
            className="rounded-xl border border-space-line px-4 py-2 text-sm text-ink-muted hover:text-ink"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

function TransaksiRow({ item, onDelete }: { item: KeuanganItem; onDelete: (id: string) => void }) {
  return (
    <tr className="border-b border-space-line/60 hover:bg-space-panel2/30">
      <td className="py-2.5 pr-3 font-mono text-[10px] text-ink-dim">{item.id}</td>
      <td className="py-2.5 pr-3 text-xs text-ink-muted whitespace-nowrap">{formatDate(item.timestamp)}</td>
      <td className="py-2.5 pr-3 text-sm text-ink">{item.keperluan}</td>
      <td className="py-2.5 pr-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${item.status === "masuk" ? "bg-signal-teal/10 text-signal-teal" : "bg-red-500/10 text-red-400"}`}>
          {item.status === "masuk" ? "↑ Masuk" : "↓ Keluar"}
        </span>
      </td>
      <td className={`py-2.5 pr-3 text-sm font-semibold tabular-nums ${item.status === "masuk" ? "text-signal-teal" : "text-red-400"}`}>
        {item.status === "masuk" ? "+" : "-"}{formatRupiah(item.jumlah)}
      </td>
      <td className="py-2.5 pr-3">
        {item.dikirim_ke_gsheet && (
          <span className="rounded-full bg-signal-teal/10 px-2 py-0.5 text-[10px] text-signal-teal">✓ GSheet</span>
        )}
      </td>
      <td className="py-2.5 text-right">
        <button
          onClick={() => confirm("Hapus transaksi ini?") && onDelete(item.id)}
          className="text-[10px] text-ink-dim hover:text-red-400"
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}

export default function KeuanganDashboard({
  initialItems,
  isEditor,
}: {
  initialItems: KeuanganItem[];
  isEditor: boolean;
}) {
  const [items, setItems] = useState<KeuanganItem[]>(initialItems);
  const [filter, setFilter] = useState<"semua" | "masuk" | "keluar">("semua");
  const [activeTab, setActiveTab] = useState<ActiveTab>("transaksi");
  const [kirimLoading, setKirimLoading] = useState(false);
  const [kirimStatus, setKirimStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleKirimGsheet() {
    const today = new Date().toISOString().slice(0, 10);
    setKirimLoading(true);
    setKirimStatus(null);
    try {
      const res = await fetch("/api/keuangan/kirim-gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal: today }),
      });
      const j = await res.json();
      if (!res.ok) { setKirimStatus({ ok: false, msg: j.message ?? "Gagal." }); return; }
      setKirimStatus({ ok: true, msg: `${j.total} transaksi hari ini berhasil dikirim.` });
      setItems((prev) =>
        prev.map((i) =>
          new Date(i.timestamp).toISOString().slice(0, 10) === today
            ? { ...i, dikirim_ke_gsheet: true }
            : i
        )
      );
    } catch { setKirimStatus({ ok: false, msg: "Terjadi kesalahan." }); }
    finally { setKirimLoading(false); }
  }

  const summary = calcSummary(items);

  const sorted = [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const filtered = filter === "semua" ? sorted : sorted.filter((i) => i.status === filter);

  const handleAdded = useCallback((item: KeuanganItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/keuangan?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-signal-gold">KIR EROBO</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">Keuangan</h1>
          <p className="mt-1 text-xs text-ink-dim">{summary.total_transaksi} total transaksi</p>
        </div>
        {isEditor && (
          <form action={bendaharaLogoutAction}>
            <button className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
              Keluar
            </button>
          </form>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Saldo" value={formatRupiah(summary.saldo)} accent={summary.saldo >= 0 ? "teal" : "gold"} />
        <StatCard label="Total Masuk" value={formatRupiah(summary.total_masuk)} accent="cyan" />
        <StatCard label="Total Keluar" value={formatRupiah(summary.total_keluar)} accent="gold" />
        <StatCard label="Transaksi" value={String(summary.total_transaksi)} accent="violet" />
      </div>

      <div className="flex gap-1 rounded-xl border border-space-line bg-space-panel/40 p-1">
        {([
          { key: "transaksi", label: "💸 Transaksi" },
          { key: "kas", label: "💰 Uang Kas" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-signal-gold text-space shadow"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "transaksi" && (
        <>
          {isEditor && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleKirimGsheet}
                disabled={kirimLoading}
                className="rounded-lg border border-space-line px-3 py-1 text-xs text-ink-muted hover:text-ink disabled:opacity-60"
              >
                {kirimLoading ? "Mengirim…" : "Kirim GSheet Hari Ini"}
              </button>
            </div>
          )}
          {kirimStatus && (
            <p className={`text-xs ${kirimStatus.ok ? "text-signal-teal" : "text-red-400"}`}>
              {kirimStatus.msg}
            </p>
          )}
          {isEditor && <TambahForm onAdded={handleAdded} />}
          <div className="rounded-2xl border border-space-line bg-space-panel/60 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-semibold text-ink">Riwayat Transaksi</h2>
              <div className="flex gap-1">
                {(["semua", "masuk", "keluar"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      filter === f ? "bg-signal-gold/20 text-signal-gold" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xl">💸</p>
                <p className="mt-1 text-sm text-ink-muted">Belum ada transaksi.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-space-line text-xs text-ink-dim">
                      <th className="py-2 pr-3 font-medium">ID</th>
                      <th className="py-2 pr-3 font-medium">Waktu</th>
                      <th className="py-2 pr-3 font-medium">Keperluan</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 pr-3 font-medium">Jumlah</th>
                      <th className="py-2 pr-3 font-medium"></th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <TransaksiRow key={item.id} item={item} onDelete={isEditor ? handleDelete : () => {}} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "kas" && <KasPanel />}
    </div>
  );
}