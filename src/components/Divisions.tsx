import { DIVISIONS } from "@/data/content";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

const DIVISION_STYLE = {
  violet: {
    ring: "border-signal-violet/40 bg-signal-violet/10",
    glow: "hover:shadow-glow",
  },
  cyan: {
    ring: "border-signal-cyan/40 bg-signal-cyan/10",
    glow: "hover:shadow-glow-cyan",
  },
  teal: {
    ring: "border-signal-teal/40 bg-signal-teal/10",
    glow: "hover:shadow-glow-cyan",
  },
} as const;

export default function Divisions() {
  return (
    <section id="divisi" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="eyebrow text-signal-gold">Divisi</span>
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Tiga Jalur, Satu Rasa Ingin Tahu
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
            Setiap divisi punya fokus dan cara kerjanya sendiri, tapi semuanya
            bertumpu pada semangat yang sama: bertanya, meneliti, dan mencipta.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {DIVISIONS.map((division) => {
            const style = DIVISION_STYLE[division.accent];
            return (
              <div
                key={division.id}
                className={`glass-panel group rounded-2xl p-6 transition-all sm:p-7 ${style.glow}`}
              >
                <span
                  className={`hex-frame relative flex h-14 w-14 items-center justify-center overflow-hidden border ${style.ring}`}
                >
                  <ImageWithSkeleton
                    src={division.logo}
                    alt={`Logo divisi ${division.name}`}
                    fill
                    sizes="56px"
                    className="object-cover p-2"
                  />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold text-ink sm:text-xl">
                  {division.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-ink-dim">
                  {division.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  {division.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}