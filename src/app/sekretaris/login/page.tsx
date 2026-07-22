"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sekretarisLoginAction, type SekretarisActionState } from "../actions";

const initialState: SekretarisActionState = {};

export default function SekretarisLoginPage() {
  const [state, formAction] = useFormState(sekretarisLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space bg-hex-grid px-4">
      <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel/60 p-6">
        <p className="text-xs uppercase tracking-widest text-signal-cyan">Sekretaris</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Masuk sebagai Sekretaris</h1>
        <p className="mt-1 text-sm text-ink-muted">Kelola absensi kegiatan KIR EROBO.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Password Sekretaris</span>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-space-line bg-space-panel2 px-3 py-2 text-sm text-ink focus:border-signal-cyan focus:outline-none"
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
      className="w-full rounded-lg bg-signal-cyan px-4 py-2.5 text-sm font-medium text-space disabled:opacity-60"
    >
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}