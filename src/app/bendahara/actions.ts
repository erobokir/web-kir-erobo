"use server";

import { redirect } from "next/navigation";
import {
  verifyBendaharaPassword,
  setBendaharaSessionCookie,
  clearBendaharaSessionCookie,
  isBendaharaLoggedIn,
} from "@/lib/bendahara/auth";

export interface BendaharaActionState {
  error?: string;
  success?: string;
}

export async function bendaharaLoginAction(
  _prevState: BendaharaActionState,
  formData: FormData
): Promise<BendaharaActionState> {
  const password = String(formData.get("password") || "");
  if (!password) return { error: "Password wajib diisi." };
  const ok = await verifyBendaharaPassword(password);
  if (!ok) return { error: "Password salah." };
  setBendaharaSessionCookie();
  redirect("/bendahara");
}

export async function bendaharaLogoutAction() {
  clearBendaharaSessionCookie();
  redirect("/bendahara");
}
