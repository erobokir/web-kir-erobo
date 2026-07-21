export type StatusKeuangan = "masuk" | "keluar";

export interface KeuanganItem {
  id: string;
  timestamp: string;
  keperluan: string;
  status: StatusKeuangan;
  jumlah: number;
  created_at: string;
}

export interface KeuanganData {
  id: string;
  items: KeuanganItem[];
  updated_at: string;
}

export interface KeuanganSummary {
  total_masuk: number;
  total_keluar: number;
  saldo: number;
  total_transaksi: number;
}
