export interface Peserta {
  id: string;
  nama: string;
  kelas: string;
  jurusan: string;
  divisi: "AI" | "RETEK" | "Science" | "Pengurus";
}

export const DAFTAR_PESERTA: Peserta[] = [
  { id: "p01", nama: "Intan Nurhikmah", kelas: "XI", jurusan: "RPL", divisi: "Pengurus" },
  { id: "s01", nama: "Pajil Tampan", kelas: "XI", jurusan: "SIJA", divisi: "AI" },
];