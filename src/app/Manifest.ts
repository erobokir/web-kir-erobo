import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KIR EROBO Kelompok Ilmiah Remaja SMKN 1 Jakarta",
    short_name: "KIR EROBO",
    description:
      "Wadah bagi siswa SMKN 1 Jakarta untuk meneliti, berinovasi, dan menciptakan solusi bagi masa depan melalui divisi AI, Rekayasa Teknologi, dan Science.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1024",
    theme_color: "#0A1024",
    icons: [
      {
        src: "/images/brand/logo-kir.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}