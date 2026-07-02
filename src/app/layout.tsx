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

export const metadata: Metadata = {
  title: "KIR EROBO: The science of today is the technology of tomorrow",
  description:
    "KIR EROBO (Kelompok Ilmiah Remaja) SMKN 1 Jakarta, wadah bagi siswa untuk meneliti, berinovasi, dan menciptakan solusi bagi masa depan melalui divisi AI, Rekayasa Teknologi, dan Science.",
  icons: {
    icon: "/images/brand/logo-kir.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${poppins.variable} ${mono.variable}`}>
      <body className="bg-space font-body text-ink antialiased selection:bg-signal-violet/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}