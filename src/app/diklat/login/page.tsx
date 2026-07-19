"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { diklatLoginAction, type DiklatActionState } from "../actions";

const initialState: DiklatActionState = {};

export default function DiklatLoginPage() {
  const [state, formAction] = useFormState(diklatLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space bg-hex-grid px-4">
      <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel/60 p-6">
        <p className="text-xs uppercase tracking-widest text-signal-cyan">Diklat</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Masuk sebagai Diklat</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Untuk mengedit data. Kalau kamu cuma ingin melihat data, tidak perlu login
          langsung buka halaman{" "}
          <Link href="/diklat" className="text-signal-violet underline">
            /diklat
          </Link>
          .
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Password Diklat</span>
            <input name="password" type="password" required autoFocus className="input" />
          </label>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <SubmitButton />
        </form>
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-signal-violet px-4 py-2.5 text-sm font-medium text-white shadow-glow disabled:opacity-60"
    >
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}
