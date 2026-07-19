"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changeDiklatPasswordAction, type DiklatActionState } from "@/app/diklat/actions";

const initialState: DiklatActionState = {};

export default function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState(changeDiklatPasswordAction, initialState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-space-line bg-space-panel p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Ganti Password Diklat</h2>
        <form action={formAction} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Password Saat Ini</span>
            <input name="currentPassword" type="password" required className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Password Baru</span>
            <input name="newPassword" type="password" minLength={6} required className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-dim">Konfirmasi Password Baru</span>
            <input name="confirmPassword" type="password" minLength={6} required className="input" />
          </label>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-signal-teal">{state.success}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-space-line px-4 py-2 text-sm text-ink-muted"
            >
              Tutup
            </button>
            <SubmitButton />
          </div>
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
      className="rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "Ganti Password"}
    </button>
  );
}
