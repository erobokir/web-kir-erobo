"use server";

import { redirect } from "next/navigation";
import {
  verifyDiklatPassword,
  setDiklatSessionCookie,
  clearDiklatSessionCookie,
} from "@/lib/diklat/auth";

export interface PrestasiActionState {
  error?: string;
  success?: string;
}

export async function prestasiDiklatLoginAction(
  _prevState: PrestasiActionState,
  formData: FormData
): Promise<PrestasiActionState> {
  const password = String(formData.get("password") || "");
  if (!password) return { error: "Password wajib diisi." };

  const ok = await verifyDiklatPassword(password);
  if (!ok) return { error: "Password salah." };

  setDiklatSessionCookie();
  redirect("/prestasi");
}

export async function prestasiDiklatLogoutAction() {
  clearDiklatSessionCookie();
  redirect("/prestasi");
}