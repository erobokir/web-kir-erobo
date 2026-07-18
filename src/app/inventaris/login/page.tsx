"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import { ApiError } from "@/lib/inventory/api";

export default function InventarisLoginPage() {
  const router = useRouter();
  const { login } = useInventoryAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/inventaris");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-2xl font-semibold text-ink">Masuk</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Untuk superadmin, ketua ekskul, dan divisi organisasi.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-violet focus:outline-none"
            placeholder="nama@akses"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-dim">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-violet focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-signal-violet px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
