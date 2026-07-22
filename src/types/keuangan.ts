export type StatusKeuangan = "masuk" | "keluar";
export type StatusKas = "lunas" | "belum";

export interface KeuanganItem {
  id: string;
  timestamp: string;
  keperluan: string;
  status: StatusKeuangan;
  jumlah: number;
  created_at: string;
}

export interface KasRecord {
  peserta_id: string;
  nama: string;
  kelas: string;
  divisi: string;
  status: StatusKas;
  jumlah: number;
  tanggal_bayar?: string;
  keterangan?: string;
}

export interface KasSession {
  id: string;
  periode: string;
  nominal_per_orang: number;
  records: KasRecord[];
  created_at: string;
}

export interface KeuanganData {
  id: string;
  items: KeuanganItem[];
  updated_at: string;
}

export interface KasData {
  id: string;
  sessions: KasSession[];
  updated_at: string;
}

export interface KeuanganSummary {
  total_masuk: number;
  total_keluar: number;
  saldo: number;
  total_transaksi: number;
}

export interface KasSummary {
  total_lunas: number;
  total_belum: number;
  total_terkumpul: number;
  total_sessions: number;
}