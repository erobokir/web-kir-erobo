export type StatusAbsen = "hadir" | "izin" | "sakit" | "alpha";

export interface AbsenRecord {
  peserta_id: string;
  nama: string;
  kelas: string;
  divisi: string;
  jurusan: string;
  status: StatusAbsen;
  keterangan?: string;
}

export interface AbsensiSession {
  id: string;
  tanggal: string;
  kegiatan: string;
  records: AbsenRecord[];
  created_at: string;
  dikirim_ke_gsheet: boolean;
}

export interface AbsensiData {
  id: string;
  sessions: AbsensiSession[];
  updated_at: string;
}