import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const DIKLAT_COOKIE_NAME = "diklat_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 hari

function getSessionSecret(): string {
  const secret = process.env.DIKLAT_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "DIKLAT_SESSION_SECRET belum diset di environment variable (.env.local)."
    );
  }
  return secret;
}

export function hashDiklatPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyDiklatPasswordHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export async function verifyDiklatPassword(password: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("diklat_credentials")
    .select("password_hash")
    .eq("id", "diklat")
    .maybeSingle();

  if (error || !data) return false;
  return verifyDiklatPasswordHash(password, data.password_hash);
}

export async function changeDiklatPassword(newPassword: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const password_hash = hashDiklatPassword(newPassword);
  const { error } = await supabase
    .from("diklat_credentials")
    .update({ password_hash, updated_at: new Date().toISOString() })
    .eq("id", "diklat");
  if (error) throw error;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken(): string {
  const payload = JSON.stringify({ role: "diklat", exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token: string): boolean {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64);
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    return payload.role === "diklat" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Dipanggil setelah password terverifikasi benar, di dalam Server Action */
export function setDiklatSessionCookie() {
  cookies().set(DIKLAT_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearDiklatSessionCookie() {
  cookies().delete(DIKLAT_COOKIE_NAME);
}

export function isDiklatLoggedIn(): boolean {
  const token = cookies().get(DIKLAT_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function isDiklatLoggedInFromRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${DIKLAT_COOKIE_NAME}=`));
  if (!match) return false;
  const token = decodeURIComponent(match.slice(DIKLAT_COOKIE_NAME.length + 1));
  return verifySessionToken(token);
}
