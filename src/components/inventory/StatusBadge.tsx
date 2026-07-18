import type { BorrowStatus } from "@/types/inventory";

const CONFIG: Record<BorrowStatus, { label: string; className: string }> = {
  pending: { label: "Menunggu ACC", className: "bg-signal-gold/15 text-signal-gold" },
  approved: { label: "Disetujui", className: "bg-signal-cyan/15 text-signal-cyan" },
  rejected: { label: "Ditolak", className: "bg-red-500/15 text-red-400" },
  handed_out: { label: "Barang Keluar", className: "bg-signal-violet/15 text-signal-violet" },
  returned: { label: "Sudah Kembali", className: "bg-signal-teal/15 text-signal-teal" },
  partial_returned: { label: "Kembali Sebagian", className: "bg-signal-teal/10 text-signal-teal" },
};

export default function StatusBadge({ status }: { status: BorrowStatus }) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
