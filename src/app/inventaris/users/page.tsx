"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/inventory/RoleGate";
import { roleLabel } from "@/components/inventory/Sidebar";
import { apiFetch, ApiError } from "@/lib/inventory/api";
import type { InventoryUser, Role } from "@/types/inventory";

export default function UsersPage() {
  return (
    <RoleGate allow={["superadmin"]}>
      <UsersContent />
    </RoleGate>
  );
}

const ROLES: Role[] = ["superadmin", "ketua", "divisi", "guest"];

function UsersContent() {
  const [users, setUsers] = useState<InventoryUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "divisi" as Role, division: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await apiFetch<{ users: InventoryUser[] }>("/api/users");
    setUsers(res.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", body: form });
      setSuccess(`Akun ${form.name} berhasil dibuat.`);
      setForm({ name: "", email: "", password: "", role: "divisi", division: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat akun.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user: InventoryUser) {
    await apiFetch(`/api/users/${user.id}`, {
      method: "PATCH",
      body: { is_active: !user.is_active },
    });
    load();
  }

  async function remove(user: InventoryUser) {
    if (!confirm(`Hapus akun ${user.name}?`)) return;
    await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <header>
          <p className="text-xs uppercase tracking-widest text-signal-violet">Superadmin</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Kelola Akun</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Buat akun untuk ketua ekskul dan divisi organisasi.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Nama</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className="input"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Divisi (opsional)</span>
            <input
              value={form.division}
              onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
              className="input"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-signal-teal">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-signal-violet px-4 py-2.5 text-sm font-medium text-white shadow-glow disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Buat Akun"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Daftar Akun</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-space-line bg-space-panel/40 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{u.name}</p>
                <p className="text-xs text-ink-dim">
                  {u.email} · {roleLabel(u.role)}
                  {u.division ? ` · ${u.division}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(u)}
                  className={`rounded-lg px-2.5 py-1 text-xs ${
                    u.is_active
                      ? "bg-signal-teal/15 text-signal-teal"
                      : "bg-space-panel2 text-ink-dim"
                  }`}
                >
                  {u.is_active ? "Aktif" : "Nonaktif"}
                </button>
                <button
                  onClick={() => remove(u)}
                  className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs text-red-400"
                >
                  Hapus
                </button>
              </div>
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
