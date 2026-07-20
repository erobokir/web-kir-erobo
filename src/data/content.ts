import type {
  AchievementItem,
  DivisionItem,
  FaqItem,
  GalleryImage,
  JourneyStep,
  MarqueeRow,
  NavLink,
  StatItem,
  StructureTier,
} from "@/types";

export const SITE = {
  name: "KIR EROBO",
  org: "Kelompok Ilmiah Remaja",
  school: "SMKN 1 Jakarta",
  tagline: "The science of today is the technology of tomorrow",
  description:
    "KIR adalah wadah bagi siswa untuk meneliti, berinovasi, dan menciptakan solusi bagi masa depan.",
  registerUrl: "https://regist-erobo-2026.vercel.app",
  instagram: "https://instagram.com/eroboofficial",
  email: "erobokir@gmail.com",
  address: "SMKN 1 Jakarta, Jakarta Pusat, Indonesia",
};

export const NAV_LINKS: NavLink[] = [
  { href: "#home", label: "Home" },
  { href: "#tentang", label: "Tentang" },
  { href: "#journey", label: "Journey" },
  { href: "#divisi", label: "Divisi" },
  { href: "#prestasi", label: "Prestasi" },
  { href: "#struktur", label: "Struktur" },
  { href: "#faq", label: "FAQ" },
  { href: "/jadwal", label: "Jadwal" },
];

export const STATS: StatItem[] = [
  { id: "anggota", value: "50+", label: "Anggota Aktif" },
  { id: "prestasi", value: "60+", label: "Prestasi" },
  { id: "proyek", value: "50+", label: "Proyek Penelitian" },
  { id: "tahun", value: "12+", label: "Tahun Berkarya" },
];

export const DIVISIONS: DivisionItem[] = [
  {
    id: "ai",
    name: "AI",
    tagline: "Kecerdasan yang Belajar dari Data",
    description:
      "Menganalisis data, memahami pola, dan menciptakan kecerdasan buatan untuk membantu membangun inovasi berkelanjutan bagi masa depan yang lebih baik.",
    accent: "violet",
    logo: "/images/divisi/ai.png",
  },
  {
    id: "retek",
    name: "Rekayasa Teknologi",
    tagline: "Dari Rangkaian Menjadi Solusi",
    description:
      "Merancang, membangun, dan mengembangkan teknologi mulai dari coding, elektronika, hingga IoT untuk menjawab tantangan zaman.",
    accent: "cyan",
    logo: "/images/divisi/retek.png",
  },
  {
    id: "science",
    name: "Science",
    tagline: "Bertanya, Menguji, Membuktikan",
    description:
      "Meneliti, bereksperimen, dan mengungkap kebenaran di bidang sains dan pertanian untuk memperluas batas pengetahuan.",
    accent: "teal",
    logo: "/images/divisi/science.png",
  },
];

export const JOURNEY: JourneyStep[] = [
  {
    id: "awal",
    index: "01",
    year: "2012",
    title: "Awal Berdiri",
    description:
      "Berawal dari sekumpulan siswa yang aktif mengikuti lomba STEM, KIR lahir sebagai wadah resmi bagi mereka yang gemar meneliti dan berkarya.",
  },
  {
    id: "berkembang",
    index: "02",
    year: "2014 s.d. kini",
    title: "Berkembang",
    description:
      "Terbentuknya sistem OAB (Orientasi Anggota Baru) menjadikan KIR lebih terstruktur, dengan estafet kepemimpinan baru setiap tahunnya.",
  },
  {
    id: "berprestasi",
    index: "03",
    year: "2018 s.d. kini",
    title: "Berprestasi",
    description:
      "Mengukir berbagai prestasi di ajang LKIR, LKTI, dan Pemuda Pelopor, mulai dari tingkat kota hingga nasional.",
  },
  {
    id: "menginspirasi",
    index: "04",
    year: "Sekarang",
    title: "Menginspirasi",
    description:
      "Menjadi wadah lahirnya inovasi lintas divisi AI, Rekayasa Teknologi, dan Science yang bermanfaat bagi banyak orang.",
  },
];

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "Itechno Cup PNJ",
    title: "Juara 1 IoT Politeknik Negeri Jakarta",
    event: "Itechno cup Politeknik Negeri Jakarta",
    year: "2025",
    tier: "gold",
  },
  {
    id: "KIP",
    title: "Juara 3 Karya Ilmiah Pemuda wilayah Jakarta Pusat",
    event: "Lomba Karya Ilmiah Pemuda wilayah Jakarta pusat",
    year: "2025",
    tier: "bronze",
  },
  {
    id: "KIP",
    title: "Finalist Karya Ilmiah Pemuda DKI Jakarta",
    event: "Lomba Karya Ilmiah Pemuda DKI Jakarta",
    year: "2025",
    tier: "special",
  },
  {
    id: "lkir",
    title: "Juara LKIR",
    event: "Lomba Karya Ilmiah Remaja Jakarta Pusat",
    year: "2023",
    tier: "gold",
  },
  {
    id: "pemuda-pelopor",
    title: "Delegasi Pemuda Pelopor",
    event: "",
    year: "2022",
    tier: "special",
  },
  {
    id: "LKTI UNDIP",
    title: "Finalist LKTI UNDIP",
    event: "",
    year: "2025",
    tier: "special",
  },
  {
    id: "Frontend PNJ",
    title: "Finalist Frontend Politeknik Negeri Jakarta",
    event: "Itechnocup Politeknik Negeri Jakarta",
    year: "2025",
    tier: "special",
  },
  {
    id: "Itechno Cup PNJ",
    title: "Finalist IoT Politeknik Negeri Jakarta",
    event: "Itechnocup Politeknik Negeri Jakarta",
    year: "2025",
    tier: "special",
  },
  {
    id: "Itechno Cup PNJ",
    title: "Finalist ITNSA Politeknik Negeri Jakarta",
    event: "Itechnocup Politeknik Negeri Jakarta",
    year: "2025",
    tier: "special",
  },
  {
    id: "Essay Unpad",
    title: "Juara 1 Essay Unpad",
    event: "Festival Informatics UNPAD",
    year: "2025",
    tier: "gold",
  },
  {
    id: "IoT ITB Widya Gama Lumajang",
    title: "Juara 1 IoT ITB Widya Gama Lumajang",
    event: "",
    year: "2025",
    tier: "gold",
  },
  {
    id: "LKTI SMANDU",
    title: "Juara 1 LKTI LITECROWLED",
    event: "LICTEROWLED SMAN 2 Jakarta",
    year: "2026",
    tier: "gold",
  },
  {
    id: "LKTI SMANDU",
    title: "Juara 2 LKTI LITECROWLED",
    event: "LICTEROWLED SMAN 2 Jakarta",
    year: "2026",
    tier: "silver",
  },
  {
    id: "Cerpen Ilmiah SMANDU",
    title: "Juara 2 Cerpen Ilmiah LITECROWLED",
    event: "LICTEROWLED SMAN 2 Jakarta",
    year: "2026",
    tier: "silver",
  },
  {
    id: "Cerpen Ilmiah SMANDU",
    title: "Juara 3 Cerpen Ilmiah LITECROWLED",
    event: "LICTEROWLED SMAN 2 Jakarta",
    year: "2026",
    tier: "bronze",
  },
  {
    id: "Cerpen Ilmiah SMANDU",
    title: "Finalist Cerpen Ilmiah LITECROWLED",
    event: "LICTEROWLED SMAN 2 Jakarta",
    year: "2026",
    tier: "special",
  },
  {
    id: "UI/UX Compiler XVI",
    title: "Juara 3 UI/UX Compiler XVI Universitas Bakrie",
    event: "Compiler XVI Bakrie",
    year: "2026",
    tier: "bronze",
  },
  {
    id: "BINUS@Alam Sutera",
    title: "Finalist Coding and Algorithm International Competition 2026",
    event: "BINUS@Alam Sutera",
    year: "2026",
    tier: "special",
  },
];

export const STRUCTURE: StructureTier[] = [
  {
    id: "ketua-umum",
    label: "Ketua Umum",
    members: [
      { id: "intan", name: "Intan Nurhikmah", role: "Ketua Umum", photo: "/images/struktur/intan.jpeg" },
    ],
  },
  {
    id: "sekbend",
    label: "Sekretaris & Bendahara",
    members: [
      { id: "raden", name: "Raden Zahra Shadira Shifa", role: "Sekretaris", photo: "/images/struktur/Raden.jpg" },
      { id: "amel", name: "Afifah Amelia Azzahra", role: "Bendahara", photo: "/images/struktur/amel.png" },
    ],
  },
  {
    id: "diklat",
    label: "Ketua DIKLAT",
    members: [
      { id: "fazil", name: "Dhiyaa Fazila Nugraha", role: "Ketua DIKLAT", photo: "/images/struktur/Fazil.jpeg" },
    ],
  },
  {
    id: "ketua-divisi",
    label: "Ketua Divisi",
    members: [
      { id: "bayu", name: "Bayu Aji Sutanto", role: "RETEK", photo: "/images/struktur/Bayu.jpg" },
      { id: "arif", name: "Arif Raffy Fadlurahman", role: "Science", photo: "/images/struktur/Arif.jpg" },
      { id: "salsa", name: "Salsa Nabila", role: "AI", photo: "/images/struktur/Salsa.jpg" },
    ],
  },
  {
    id: "divisi-organisasi",
    label: "Divisi Organisasi",
    members: [
      { id: "amidia", name: "Amidia Radisti", role: "Divisi Organisasi", photo: "/images/struktur/Amidia.jpg" },
      { id: "early", name: "Early Janeuella", role: "Divisi Organisasi", photo: "/images/struktur/early.jpeg" },
    ],
  },
  {
    id: "divisi-publikasi",
    label: "Divisi Publikasi",
    members: [
      { id: "aira", name: "Aira Saskia Sahwa", role: "Divisi Publikasi", photo: "/images/struktur/Aira.jpg" },
      { id: "safa", name: "Safa Oktafianti", role: "Divisi Publikasi", photo: "/images/struktur/Safa.jpg" },
    ],
  },
];

export const GALLERY: GalleryImage[] = [
  { id: "g1", src: "/images/dokumentasi/IMG-20240629-WA0003.jpg", alt: "Kegiatan riset KIR EROBO" },
  { id: "g2", src: "/images/dokumentasi/IMG-20240629-WA0004.jpg", alt: "Diskusi kelompok KIR EROBO" },
  { id: "g3", src: "/images/dokumentasi/smandu.jpeg", alt: "Delegasi lomba ilmiah" },
  { id: "g4", src: "/images/dokumentasi/ubakrie.jpeg", alt: "Kompetisi karya tulis ilmiah" },
  { id: "g5", src: "/images/dokumentasi/IMG-20240629-WA0005.jpg", alt: "Presentasi proyek penelitian" },
  { id: "g6", src: "/images/dokumentasi/IMG-20240629-WA0006.jpg", alt: "Sesi eksperimen laboratorium" },
  { id: "g7", src: "/images/dokumentasi/IMG-20240629-WA0007.jpg", alt: "Foto bersama anggota KIR" },
  { id: "g8", src: "/images/dokumentasi/IMG-20240629-WA0009.jpg", alt: "Kunjungan dan kolaborasi" },
  { id: "g9", src: "/images/dokumentasi/IMG-20240629-WA0010.jpg", alt: "Pelatihan divisi teknologi" },
  { id: "g10", src: "/images/dokumentasi/IMG-20240629-WA0011.jpg", alt: "Perayaan pencapaian tim" },
  { id: "g11", src: "/images/dokumentasi/IMG-20260215-WA0028.jpg", alt: "Smandu 2026" },
  { id: "g12", src: "/images/dokumentasi/IMG-20251002-WA0055.jpg", alt: "Itechno cup pnj" },
];

export const FAQ: FaqItem[] = [
  {
    id: "jurusan",
    question: "Apakah KIR hanya untuk anak IPA saja?",
    answer:
      "Tidak. KIR EROBO terbuka untuk semua jurusan karena kami membutuhkan perspektif dari berbagai bidang keahlian untuk menciptakan inovasi yang komprehensif.",
  },
  {
    id: "biaya",
    question: "Berapa biaya untuk bergabung dengan KIR?",
    answer: "Gratis untuk seluruh peserta didik SMKN 1 Jakarta.",
  },
  {
    id: "waktu-belajar",
    question: "Apakah kegiatan KIR akan mengganggu waktu belajar?",
    answer:
      "Justru sebaliknya. Kegiatan KIR memperkuat pemahaman materi pelajaran, terutama Pipas dan DPK, karena diterapkan secara praktis. Jadwal kegiatan juga disusun agar tidak bentrok dengan jam pelajaran.",
  },
  {
    id: "syarat",
    question: "Apa saja syarat untuk bergabung?",
    answer:
      "Cukup punya rasa ingin tahu yang tinggi, mau belajar hal baru, dan berkomitmen aktif dalam kegiatan. Tidak perlu latar belakang khusus.",
  },
  {
    id: "seleksi",
    question: "Bagaimana proses seleksinya?",
    answer:
      "Proses seleksi meliputi pengisian formulir pendaftaran dan sesi perkenalan langsung dengan anggota lain.",
  },
  {
    id: "deadline",
    question: "Kapan deadline pendaftaran?",
    answer:
      "Kuota terbatas setiap periode. Hubungi kontak di bagian bawah halaman ini untuk info terbaru seputar jadwal dan deadline pendaftaran.",
  },
];

export const MARQUEE_ROW_1: MarqueeRow = [
  "Masuk KIR EROBO berpeluang untuk",
  "LKS Ekshibisi Kompetisi Kecerdasan Artifisial",
  "OSN Ekshibisi Kompetisi Kecerdasan Artifisial",
  "LKS Collaborative Robotics System Integration, dan lainnya",
];
export const MARQUEE_ROW_2: MarqueeRow = [
  "THE SCIENCE OF TODAY",
  "IS THE TECHNOLOGY OF TOMORROW",
  "THE SCIENCE OF TODAY",
  "IS THE TECHNOLOGY OF TOMORROW",
  "THE SCIENCE OF TODAY",
  "IS THE TECHNOLOGY OF TOMORROW",
];