export interface JadwalItem {
  id: string;
  nama_materi: string;
  tanggal_kegiatan: string; // ISO 8601 datetime string
  keterangan: string;
  pemateri: string;
  created_at: string;
}

export interface JadwalData {
  id: string;
  items: JadwalItem[];
  updated_at: string;
}
