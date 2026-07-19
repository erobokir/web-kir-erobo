import "server-only";

/**
 * Rate limiter in-memory sederhana (token bucket per key, mis. per IP+route).
 *
 * CATATAN PRODUKSI: in-memory berarti counter reset setiap kali server
 * restart/scale, dan TIDAK sinkron kalau instance/server lebih dari satu
 * (mis. di Vercel serverless yang multi-instance). Untuk produksi skala besar,
 * ganti dengan penyimpanan bersama seperti Upstash Redis / Vercel KV.
 * Untuk kebutuhan dasar & single-instance, ini cukup memadai.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
