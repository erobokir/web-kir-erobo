import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://kir-erobo.vercel.app";
const SITE_TITLE =
  "KIR EROBO: The Science of Today is The Technology of Tomorrow";
const SITE_DESCRIPTION =
  "KIR EROBO (Kelompok Ilmiah Remaja) SMKN 1 Jakarta, wadah bagi siswa untuk meneliti, berinovasi, dan menciptakan solusi bagi masa depan melalui divisi AI, Rekayasa Teknologi, dan Science.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | KIR EROBO",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "KIR EROBO",
    "Kelompok Ilmiah Remaja",
    "KIR SMKN 1 Jakarta",
    "ekstrakurikuler ilmiah",
    "karya ilmiah remaja",
    "LKIR",
    "LKTI",
    "divisi AI",
    "Rekayasa Teknologi",
    "Science EROBO",
    "riset siswa SMK",
    "budut",
    "EROBO",
    "Engineering Researcher of Budi Utomo",
    "SMKN 1 Jakarta",
    "ekskul SMK Jakarta",
    "komunitas ilmiah remaja Jakarta",
    "organisasi siswa SMK",
    "Budi Utomo Jakarta",
    "Jakarta Pusat",
    "KIR SMK",
    "lomba karya ilmiah remaja",
    "lomba LKTI SMA SMK",
    "Pemuda Pelopor",
    "OAB orientasi anggota baru",
    "riset dan inovasi siswa",
    "eksperimen sains remaja",
    "proyek penelitian siswa",
    "cerpen ilmiah",
    "karya tulis ilmiah remaja",
    "kompetisi sains SMK",
    "open recruitment KIR",
    "pendaftaran ekskul KIR",
    "divisi Rekayasa Teknologi",
    "divisi Science",
    "kecerdasan buatan remaja",
    "coding untuk pelajar",
    "elektronika dan IoT",
    "riset sains dan pertanian",
    "pembelajaran mesin siswa",
    "teknologi untuk pelajar SMK",
    "inovasi remaja Indonesia",
    "wadah riset pelajar",
    "pengembangan ilmu pengetahuan dan teknologi",
    "kerja sama tim pelajar",
    "berpikir kritis siswa",
    "solusi masa depan",
    "generasi inovator muda",
    "The Science of Today is The Technology of Tomorrow",
    "Inovasi hari ini solusi untuk esok hari",
    "EROBO official",
    "",
  ],
  authors: [{ name: "KIR EROBO" }],
  creator: "KIR EROBO",
  publisher: "KIR EROBO",
  applicationName: "KIR EROBO",
  category: "education",

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [{ url: "/images/brand/logo-kir.png", type: "image/png" }],
    shortcut: "/images/brand/logo-kir.png",
    apple: "/images/brand/logo-kir.png",
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "KIR EROBO",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "KIR EROBO — Kelompok Ilmiah Remaja SMKN 1 Jakarta",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/brand/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "KIR EROBO",
  alternateName: "Kelompok Ilmiah Remaja EROBO",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  logo: `${SITE_URL}/images/brand/logo-kir.png`,
  image: `${SITE_URL}/images/brand/og-image.png`,
  foundingDate: "2012",
  parentOrganization: {
    "@type": "EducationalOrganization",
    name: "SMKN 1 Jakarta",
  },
  sameAs: ["https://instagram.com/eroboofficial"],
  department: [
    { "@type": "Organization", name: "AI (Artificial Intelligence)" },
    { "@type": "Organization", name: "Rekayasa Teknologi" },
    { "@type": "Organization", name: "Science" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${poppins.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-space font-body text-ink antialiased selection:bg-signal-violet/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}