"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { diklatLogoutAction } from "@/app/diklat/actions";
import ChangePasswordForm from "./ChangePasswordForm";
import type { DiklatColumn, DiklatRow, DiklatSheet } from "@/types/diklat";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

function slugifyKey(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${base || "kolom"}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function DiklatSheetView({
  initialSheet,
  isEditor,
}: {
  initialSheet: DiklatSheet;
  isEditor: boolean;
}) {
  const [title, setTitle] = useState(initialSheet.title);
  const [columns, setColumns] = useState<DiklatColumn[]>(initialSheet.columns);
  const [rows, setRows] = useState<DiklatRow[]>(initialSheet.rows);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [showChangePassword, setShowChangePassword] = useState(false);

  const dirtyRef = useRef(dirty);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel("diklat-sheet-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "diklat_sheet_data",
          filter: "id=eq.main",
        },
        (payload) => {
          if (dirtyRef.current) return;
          const next = payload.new as DiklatSheet;
          setTitle(next.title);
          setColumns(next.columns);
          setRows(next.rows);
        },
      )
      .subscribe((subStatus) => {
        if (subStatus === "SUBSCRIBED") setStatus("connected");
        else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(subStatus)) {
          setStatus("disconnected");
        } else {
          setStatus("connecting");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const save = useCallback(
    async (
      nextTitle: string,
      nextColumns: DiklatColumn[],
      nextRows: DiklatRow[],
    ) => {
      setSaving(true);
      try {
        const res = await fetch("/api/diklat/sheet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: nextTitle,
            columns: nextColumns,
            rows: nextRows,
          }),
        });
        if (res.ok) setDirty(false);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  function scheduleSave(
    nextTitle: string,
    nextColumns: DiklatColumn[],
    nextRows: DiklatRow[],
  ) {
    setDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () => save(nextTitle, nextColumns, nextRows),
      800,
    );
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);
  function handleTitleChange(value: string) {
    setTitle(value);
    scheduleSave(value, columns, rows);
  }

  function updateCell(rowId: string, colKey: string, value: string) {
    const nextRows = rows.map((r) =>
      r.id === rowId ? { ...r, cells: { ...r.cells, [colKey]: value } } : r,
    );
    setRows(nextRows);
    scheduleSave(title, columns, nextRows);
  }

  function addColumn() {
    const label = prompt("Nama kolom baru:");
    if (!label) return;
    const key = slugifyKey(label);
    const nextColumns = [...columns, { key, label }];
    const nextRows = rows.map((r) => ({
      ...r,
      cells: { ...r.cells, [key]: "" },
    }));
    setColumns(nextColumns);
    setRows(nextRows);
    scheduleSave(title, nextColumns, nextRows);
  }

  function renameColumn(key: string) {
    const current = columns.find((c) => c.key === key);
    const label = prompt("Ganti nama kolom menjadi:", current?.label);
    if (!label) return;
    const nextColumns = columns.map((c) =>
      c.key === key ? { ...c, label } : c,
    );
    setColumns(nextColumns);
    scheduleSave(title, nextColumns, rows);
  }

  function removeColumn(key: string) {
    if (!confirm("Hapus kolom ini beserta seluruh isinya?")) return;
    const nextColumns = columns.filter((c) => c.key !== key);
    const nextRows = rows.map((r) => {
      const cells = { ...r.cells };
      delete cells[key];
      return { ...r, cells };
    });
    setColumns(nextColumns);
    setRows(nextRows);
    scheduleSave(title, nextColumns, nextRows);
  }

  function addRow() {
    const cells: Record<string, string> = {};
    columns.forEach((c) => (cells[c.key] = ""));
    const nextRows = [...rows, { id: `r${Date.now()}`, cells }];
    setRows(nextRows);
    scheduleSave(title, columns, nextRows);
  }

  function removeRow(id: string) {
    if (!confirm("Hapus baris ini?")) return;
    const nextRows = rows.filter((r) => r.id !== id);
    setRows(nextRows);
    scheduleSave(title, columns, nextRows);
  }

  async function exportToExcel() {
    const XLSX = await import("xlsx");
    const header = columns.map((c) => c.label);
    const data = rows.map((r) => columns.map((c) => r.cells[c.key] ?? ""));
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    const sheetName = (title || "Sheet1").slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const filename = `${(title || "data-diklat").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-signal-cyan">
            Diklat
          </p>
          {isEditor ? (
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-transparent bg-transparent font-display text-2xl font-semibold text-ink focus:border-signal-violet focus:bg-space-panel2 focus:px-2 focus:py-1 focus:outline-none"
            />
          ) : (
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              {title}
            </h1>
          )}
        </div>

        <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
          <ConnectionBadge status={status} />
          <button
            onClick={exportToExcel}
            className="w-full md:w-auto rounded-lg bg-signal-teal/20 px-3 py-2 text-xs font-medium text-signal-teal"
          >
            Export ke Excel (.xlsx)
          </button>
          {isEditor ? (
            <>
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full md:w-auto rounded-lg border border-space-line px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink"
              >
                Ganti Password
              </button>
              <form action={diklatLogoutAction}>
                <button className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/diklat/login"
              className="w-full text-center md:w-auto rounded-lg bg-signal-violet/20 px-3 py-2 text-xs font-medium text-signal-violet"
            >
              Masuk sebagai Diklat
            </Link>
          )}
        </div>
      </header>

      {isEditor && (
        <div className="flex items-center gap-2 text-xs text-ink-dim">
          <span>
            {saving
              ? "Menyimpan..."
              : dirty
                ? "Ada perubahan belum tersimpan..."
                : "Semua perubahan tersimpan"}
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-space-line bg-space-panel/60">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-space-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 font-medium text-ink-dim"
                >
                  <div className="flex items-center gap-1">
                    <span
                      onClick={() => isEditor && renameColumn(col.key)}
                      className={
                        isEditor ? "cursor-pointer hover:text-ink" : ""
                      }
                    >
                      {col.label}
                    </span>
                    {isEditor && (
                      <button
                        onClick={() => removeColumn(col.key)}
                        className="text-ink-dim hover:text-red-400"
                        title="Hapus kolom"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {isEditor && <th className="w-10 px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-space-line/60">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-1.5 text-ink">
                    {isEditor ? (
                      <input
                        value={row.cells[col.key] ?? ""}
                        onChange={(e) =>
                          updateCell(row.id, col.key, e.target.value)
                        }
                        className="w-full rounded bg-transparent px-1 py-1 focus:bg-space-panel2 focus:outline-none"
                      />
                    ) : (
                      <span>{row.cells[col.key] ?? ""}</span>
                    )}
                  </td>
                ))}
                {isEditor && (
                  <td className="px-3 py-1.5 text-right">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-ink-dim hover:text-red-400"
                    >
                      🗑
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1) + 1}
                  className="px-3 py-6 text-center text-ink-dim"
                >
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditor && (
        <div className="flex gap-2">
          <button
            onClick={addRow}
            className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
          >
            + Tambah Baris
          </button>
          <button
            onClick={addColumn}
            className="rounded-lg border border-space-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
          >
            + Tambah Kolom
          </button>
        </div>
      )}

      {!isEditor && (
        <p className="text-xs text-ink-dim">
          Tampilan ini hanya-lihat dan otomatis update secara real-time saat
          data diklat mengubah isinya.
        </p>
      )}

      {showChangePassword && (
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    connected: {
      label: "🟢 Live",
      className: "bg-signal-teal/15 text-signal-teal",
    },
    connecting: {
      label: "🟡 Menghubungkan...",
      className: "bg-signal-gold/15 text-signal-gold",
    },
    disconnected: {
      label: "🔴 Terputus",
      className: "bg-red-500/15 text-red-400",
    },
  } as const;
  const c = config[status];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}
