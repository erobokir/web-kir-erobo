"use server";

import { redirect } from "next/navigation";
import {
  verifySekretarisPassword,
  setSekretarisSessionCookie,
  clearSekretarisSessionCookie,
} from "@/lib/sekretaris/auth";

export interface SekretarisActionState {
  error?: string;
  success?: string;
}

export async function sekretarisLoginAction(
  _prevState: SekretarisActionState,
  formData: FormData
): Promise<SekretarisActionState> {
  const password = String(formData.get("password") || "");
  if (!password) return { error: "Password wajib diisi." };
  const ok = await verifySekretarisPassword(password);
  if (!ok) return { error: "Password salah." };
  setSekretarisSessionCookie();
  redirect("/sekretaris");
}

export async function sekretarisLogoutAction() {
  clearSekretarisSessionCookie();
  redirect("/sekretaris");
}