"use server";

import { redirect } from "next/navigation";
import {
  verifyDiklatPassword,
  setDiklatSessionCookie,
  clearDiklatSessionCookie,
  changeDiklatPassword,
  isDiklatLoggedIn,
} from "@/lib/diklat/auth";

export interface DiklatActionState {
  error?: string;
  success?: string;
}

export async function diklatLoginAction(
  _prevState: DiklatActionState,
  formData: FormData
): Promise<DiklatActionState> {
  const password = String(formData.get("password") || "");
  if (!password) return { error: "Password wajib diisi." };

  const ok = await verifyDiklatPassword(password);
  if (!ok) return { error: "Password salah." };

  setDiklatSessionCookie();
  redirect("/diklat");
}

export async function diklatLogoutAction() {
  clearDiklatSessionCookie();
  redirect("/diklat");
}

export async function changeDiklatPasswordAction(
  _prevState: DiklatActionState,
  formData: FormData
): Promise<DiklatActionState> {
  if (!isDiklatLoggedIn()) {
    return { error: "Sesi kamu sudah habis, silakan login ulang." };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword) {
    return { error: "Semua field wajib diisi." };
  }
  if (newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password baru tidak cocok." };
  }

  const ok = await verifyDiklatPassword(currentPassword);
  if (!ok) return { error: "Password saat ini salah." };

  await changeDiklatPassword(newPassword);
  return { success: "Password berhasil diganti." };
}
