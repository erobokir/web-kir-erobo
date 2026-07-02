import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#F5F8FF",
          muted: "#AEB9DE",
          dim: "#8892BB",
        },
        space: {
          DEFAULT: "#0A1024",
          panel: "#131C40",
          panel2: "#182352",
          line: "rgba(174, 185, 222, 0.16)",
        },
        signal: {
          violet: "#8B6BFF",
          cyan: "#4FE0FF",
          teal: "#4CFFDA",
          gold: "#FFD873",
        },
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "hex-grid":
          "radial-gradient(circle at 20% 20%, rgba(139,107,255,0.22), transparent 40%), radial-gradient(circle at 80% 0%, rgba(79,224,255,0.18), transparent 40%), radial-gradient(circle at 50% 100%, rgba(76,255,218,0.14), transparent 45%)",
        "panel-gradient":
          "linear-gradient(155deg, rgba(139,107,255,0.16) 0%, rgba(19,28,64,0.5) 40%, rgba(14,20,46,0.8) 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,107,255,0.32), 0 8px 44px -8px rgba(139,107,255,0.45)",
        "glow-cyan": "0 0 0 1px rgba(79,224,255,0.32), 0 8px 44px -8px rgba(79,224,255,0.45)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "spin-slow": "spin-slow 26s linear infinite",
        marquee: "marquee 40s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;