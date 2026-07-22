import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const SEKRETARIS_COOKIE_NAME = "sekretaris_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function getSessionSecret(): string {
  const secret = process.env.DIKLAT_SESSION_SECRET;
  if (!secret) throw new Error("DIKLAT_SESSION_SECRET belum diset.");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function hashSekretarisPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export async function verifySekretarisPassword(password: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sekretaris_credentials")
    .select("password_hash")
    .eq("id", "sekretaris")
    .maybeSingle();
  if (error || !data) return false;
  return verifyHash(password, data.password_hash);
}

function createSessionToken(): string {
  const payload = JSON.stringify({ role: "sekretaris", exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
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
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    return payload.role === "sekretaris" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function setSekretarisSessionCookie() {
  cookies().set(SEKRETARIS_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSekretarisSessionCookie() {
  cookies().delete(SEKRETARIS_COOKIE_NAME);
}

export function isSekretarisLoggedIn(): boolean {
  const token = cookies().get(SEKRETARIS_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}