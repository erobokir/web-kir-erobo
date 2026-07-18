export type Role = "superadmin" | "ketua" | "divisi" | "guest";

export interface InventoryUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  division?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  unit: string;
  quantity: number;
  min_stock: number;
  location?: string | null;
  image_url?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type LogType = "masuk" | "keluar";

export interface ItemLog {
  id: string;
  item_id: string;
  type: LogType;
  quantity: number;
  note?: string | null;
  reference_borrow_id?: string | null;
  created_at: string;
  users?: { name: string; role: Role } | null;
  items?: { name: string; code: string; unit: string } | null;
}

export type BorrowStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "handed_out"
  | "returned"
  | "partial_returned";

export interface BorrowRequest {
  id: string;
  item_id: string;
  quantity: number;
  division: string;
  purpose: string;
  status: BorrowStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  approved_at?: string | null;
  handed_out_at?: string | null;
  items?: Item | null;
  requester?: { name: string; role: Role; division?: string | null } | null;
  approver?: { name: string } | null;
  handler?: { name: string } | null;
}

export interface ReturnRecord {
  id: string;
  borrow_request_id: string;
  quantity_returned: number;
  condition: "baik" | "rusak_ringan" | "rusak_berat" | "hilang";
  note?: string | null;
  created_at: string;
  receiver?: { name: string } | null;
}

export interface DashboardSummary {
  totalItems: number;
  totalStock: number;
  lowStockCount: number;
  pendingRequests: number;
  sedangDipinjam?: number;
}
