"use client";

import { useMemo, useState } from "react";
import { ACHIEVEMENTS } from "@/data/content";
import { IconTrophy } from "@/components/icons";

const TIER_STYLE = {
  gold: "border-signal-gold/40 bg-signal-gold/10 text-signal-gold",
  silver: "border-ink-muted/40 bg-ink-muted/10 text-ink-muted",
  bronze: "border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan",
  special: "border-signal-violet/40 bg-signal-violet/10 text-signal-violet",
} as const;

const TIER_RANK = {
  gold: 0,
  silver: 1,
  bronze: 2,
  special: 3,
} as const;

const INITIAL_VISIBLE = 4;

export default function Achievements() {
  const [showAll, setShowAll] = useState(false);

  const sortedAchievements = useMemo(() => {
    return [...ACHIEVEMENTS].sort((a, b) => {
      const yearDiff = Number(b.year) - Number(a.year);
      if (yearDiff !== 0) return yearDiff;
      return TIER_RANK[a.tier] - TIER_RANK[b.tier];
    });
  }, []);

  const visibleAchievements = showAll
    ? sortedAchievements
    : sortedAchievements.slice(0, INITIAL_VISIBLE);

  const hiddenCount = sortedAchievements.length - INITIAL_VISIBLE;

  return (
    <section id="prestasi" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <span className="eyebrow text-signal-gold">Prestasi Kami</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
              Bukti dari Rasa Ingin Tahu
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Sepanjang perjalanan KIR, banyak pencapaian diraih lewat lomba
              LKIR, Pemuda Pelopor, dan LKTI, mulai dari tingkat kota hingga
              nasional. Setiap prestasi adalah bukti bahwa KIR EROBO adalah
              wadah inspiratif bagi remaja untuk berkembang di bidang sains,
              teknologi, dan sosial.
            </p>
          </div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleAchievements.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel flex items-start gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1"
                >
                  <span
                    className={`hex-frame flex h-11 w-11 shrink-0 items-center justify-center border ${TIER_STYLE[item.tier]}`}
                  >
                    <IconTrophy className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs tracking-wide text-ink-dim">
                      {item.year}
                    </p>
                    <h3 className="mt-1 font-display text-base font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-snug text-ink-muted">
                      {item.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {hiddenCount > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="rounded-full border border-space-line px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-signal-gold/40 hover:text-signal-gold"
                >
                  {showAll
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat ${hiddenCount} Prestasi Lainnya`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}