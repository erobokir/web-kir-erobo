"use client";

import Link from "next/link";
import { useInventoryAuth } from "@/lib/inventory/auth-context";
import type { Role } from "@/types/inventory";

export default function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useInventoryAuth();

  if (loading) {
    return <p className="text-sm text-ink-dim">Memuat...</p>;
  }

  const role = user?.role || "guest";

  if (!allow.includes(role)) {
    return (
      <div className="rounded-2xl border border-space-line bg-space-panel p-6 text-sm text-ink-muted">
        <p className="mb-2 font-medium text-ink">Akses dibatasi</p>
        <p>
          Fitur ini hanya bisa diakses oleh role tertentu.{" "}
          {!user && (
            <>
              Silakan{" "}
              <Link href="/inventaris/login" className="text-signal-violet underline">
                masuk
              </Link>{" "}
              terlebih dahulu.
            </>
          )}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
