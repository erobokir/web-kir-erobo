import { isDiklatLoggedIn } from "@/lib/diklat/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { DiklatColumn, DiklatRow } from "@/types/diklat";

function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

const MAX_COLUMNS = 30;
const MAX_ROWS = 500;

function validateBody(body: unknown): { title: string; columns: DiklatColumn[]; rows: DiklatRow[] } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.slice(0, 120) : "Data Diklat";

  if (!Array.isArray(b.columns) || !Array.isArray(b.rows)) return null;
  if (b.columns.length > MAX_COLUMNS || b.rows.length > MAX_ROWS) return null;

  const columns: DiklatColumn[] = [];
  for (const c of b.columns) {
    if (!c || typeof c !== "object") return null;
    const key = String((c as Record<string, unknown>).key || "").slice(0, 60);
    const label = String((c as Record<string, unknown>).label || "").slice(0, 100);
    if (!key) return null;
    columns.push({ key, label: label || key });
  }

  const rows: DiklatRow[] = [];
  for (const r of b.rows) {
    if (!r || typeof r !== "object") return null;
    const id = String((r as Record<string, unknown>).id || "").slice(0, 60);
    const rawCells = (r as Record<string, unknown>).cells;
    if (!id || !rawCells || typeof rawCells !== "object") return null;

    const cells: Record<string, string> = {};
    for (const col of columns) {
      const value = (rawCells as Record<string, unknown>)[col.key];
      cells[col.key] = typeof value === "string" ? value.slice(0, 2000) : "";
    }
    rows.push({ id, cells });
  }

  return { title, columns, rows };
}

/** PUT { title, columns, rows } -- hanya role diklat yang login yang boleh menyimpan */
export async function PUT(request: Request) {
  if (!isDiklatLoggedIn()) {
    return jsonError("Sesi kamu sudah habis atau belum login sebagai diklat.", 401);
  }

  const rl = checkRateLimit(`diklat-save:${getClientIp(request)}`, {
    limit: 60,
    windowMs: 60 * 1000, // 60 penyimpanan / menit (cukup longgar untuk autosave)
  });
  if (!rl.allowed) {
    return jsonError("Terlalu sering menyimpan, tunggu sebentar.", 429);
  }

  const body = await request.json().catch(() => null);
  const validated = validateBody(body);
  if (!validated) {
    return jsonError("Data sheet tidak valid.", 400);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("diklat_sheet_data")
    .update({
      title: validated.title,
      columns: validated.columns,
      rows: validated.rows,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "main")
    .select()
    .single();

  if (error) return jsonError(error.message, 500);

  return Response.json({ sheet: data });
}
