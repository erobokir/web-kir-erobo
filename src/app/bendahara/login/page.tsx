"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { bendaharaLoginAction, type BendaharaActionState } from "../actions";

const initialState: BendaharaActionState = {};

export default function BendaharaLoginPage() {
  const [state, formAction] = useFormState(bendaharaLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space bg-hex-grid px-4">
      <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel/60 p-6">
        <p className="text-xs uppercase tracking-widest text-signal-gold">Bendahara</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Masuk sebagai Bendahara</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Untuk mengelola data keuangan. Laporan keuangan juga tersedia di{" "}
          <Link href="/inventaris" className="text-signal-violet underline">
            dashboard ketua
          </Link>
          .
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Password Bendahara</span>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-violet focus:outline-none"
            />
          </label>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-signal-gold px-4 py-2.5 text-sm font-medium text-space disabled:opacity-60"
    >
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}
