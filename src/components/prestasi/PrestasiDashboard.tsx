"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { prestasiDiklatLogoutAction } from "@/app/prestasi/actions";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import { getToken } from "@/lib/inventory/api";
import { roleLabel } from "@/components/inventory/Sidebar";
import { IconTrophy } from "@/components/icons";
import type { PrestasiItem, PrestasiTier } from "@/types/prestasi";

const TIER_STYLE: Record<PrestasiTier, string> = {
  gold: "border-signal-gold/40 bg-signal-gold/10 text-signal-gold",
  silver: "border-ink-muted/40 bg-ink-muted/10 text-ink-muted",
  bronze: "border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan",
  special: "border-signal-violet/40 bg-signal-violet/10 text-signal-violet",
};

const TIER_RANK: Record<PrestasiTier, number> = { gold: 0, silver: 1, bronze: 2, special: 3 };

const TIER_LABEL: Record<PrestasiTier, string> = {
  gold: "🥇 Gold",
  silver: "🥈 Silver",
  bronze: "🥉 Bronze",
  special: "⭐ Special",
};

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function TambahPrestasiForm({ onAdded }: { onAdded: (item: PrestasiItem) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/prestasi", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: fd.get("title"),
          event: fd.get("event"),
          year: fd.get("year"),
          tier: fd.get("tier"),
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-signal-gold/40 bg-signal-gold/5 py-3 text-sm font-medium text-signal-gold transition-colors hover:bg-signal-gold/10"
      >
        <span className="text-base leading-none">+</span> Tambah Prestasi
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-signal-gold/30 bg-space-panel/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-signal-gold">Tambah Prestasi</p>
        <button
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="text-sm text-ink-dim hover:text-ink"
        >
          ✕
        </button>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Judul Prestasi *</label>
          <input
            name="title"
            required
            placeholder="cth. Juara 1 IoT Politeknik Negeri Jakarta"
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Nama Lomba / Ajang</label>
          <input
            name="event"
            placeholder="cth. Itechno Cup Politeknik Negeri Jakarta"
            className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-gold focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ink-dim">Tahun *</label>
            <input
              name="year"
              required
              placeholder="2026"
              className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-signal-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-dim">Tingkat *</label>
            <select
              name="tier"
              required
              defaultValue=""
              className="w-full rounded-xl border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-gold focus:outline-none"
            >
              <option value="" disabled>
                Pilih...
              </option>
              <option value="gold">🥇 Gold</option>
              <option value="silver">🥈 Silver</option>
              <option value="bronze">🥉 Bronze</option>
              <option value="special">⭐ Special</option>
            </select>
          </div>
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
            onClick={() => {
              setOpen(false);
              setError("");
            }}
            className="rounded-xl border border-space-line px-4 py-2 text-sm text-ink-muted hover:text-ink"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

function PrestasiRow({ item, onDelete }: { item: PrestasiItem; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-space-line bg-space-panel/60 p-4">
      <span
        className={`hex-frame flex h-11 w-11 shrink-0 items-center justify-center border ${TIER_STYLE[item.tier]}`}
      >
        <IconTrophy className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs tracking-wide text-ink-dim">{item.year}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TIER_STYLE[item.tier]}`}>
            {TIER_LABEL[item.tier]}
          </span>
        </div>
        <h3 className="mt-1 font-display text-base font-semibold text-ink">{item.title}</h3>
        {item.event && <p className="mt-0.5 text-sm leading-snug text-ink-muted">{item.event}</p>}
      </div>
      <button
        onClick={() => confirm("Hapus prestasi ini?") && onDelete(item.id)}
        className="shrink-0 text-xs text-ink-dim hover:text-red-400"
      >
        Hapus
      </button>
    </div>
  );
}

export default function PrestasiDashboard({
  initialItems,
  isDiklat,
}: {
  initialItems: PrestasiItem[];
  isDiklat: boolean;
}) {
  const [items, setItems] = useState<PrestasiItem[]>(initialItems);
  const { user, loading: authLoading, logout: inventoryLogout } = useInventoryAuth();

  const isKetua = user?.role === "ketua" || user?.role === "superadmin";
  const isEditor = isDiklat || isKetua;

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const yearDiff = Number(b.year) - Number(a.year);
      if (yearDiff !== 0) return yearDiff;
      const tierDiff = TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (tierDiff !== 0) return tierDiff;
      // Kalau tahun & tingkat sama, yang paling baru diinput tampil duluan.
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items]);

  const handleAdded = useCallback((item: PrestasiItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/prestasi?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Selama status login ketua (dari token inventaris) belum selesai dicek
  // dan bukan diklat, tampilkan loading dulu -- supaya tidak "kedip" ke
  // layar terkunci sebelum ketahuan ternyata sudah login sebagai ketua.
  if (!isDiklat && authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-dim">Memuat...</p>
      </div>
    );
  }

  // Halaman prestasi dikunci total kalau belum login sebagai ketua/diklat.
  if (!isEditor) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel/60 p-6 text-center">
          <p className="text-2xl">🔐</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">Akses Terbatas</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Halaman ini hanya untuk ketua ekskul dan diklat.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/inventaris/login"
              className="rounded-xl bg-signal-gold px-5 py-2.5 text-sm font-medium text-space hover:opacity-90"
            >
              Login Ketua
            </Link>
            <Link
              href="/prestasi/login"
              className="rounded-xl border border-space-line px-5 py-2.5 text-sm text-ink-muted hover:text-ink"
            >
              Login Diklat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const backHref = isDiklat ? "/diklat" : "/inventaris";
  const backLabel = isDiklat ? "Diklat" : "Inventaris";

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Kembali ke {backLabel}
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-signal-gold">KIR EROBO</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">Prestasi</h1>
          <p className="mt-1 text-xs text-ink-dim">{items.length} prestasi tercatat</p>
        </div>

        {isDiklat ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-signal-gold/10 px-3 py-1.5 text-xs font-medium capitalize text-signal-gold">
              Diklat
            </span>
            <form action={prestasiDiklatLogoutAction}>
              <button className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-signal-gold/10 px-3 py-1.5 text-xs font-medium text-signal-gold">
              {roleLabel(user!.role)}
            </span>
            <button
              onClick={inventoryLogout}
              className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
            >
              Keluar
            </button>
          </div>
        )}
      </header>

      <TambahPrestasiForm onAdded={handleAdded} />

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-space-line py-10 text-center">
          <p className="text-xl">🏆</p>
          <p className="mt-1 text-sm text-ink-muted">Belum ada prestasi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => (
            <PrestasiRow key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}