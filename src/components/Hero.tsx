import { SITE, DIVISIONS } from "@/data/content";
import { IconArrowRight } from "@/components/icons";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

const DIVISION_COLOR = {
  violet: "border-signal-violet/40 bg-signal-violet/10",
  cyan: "border-signal-cyan/40 bg-signal-cyan/10",
  teal: "border-signal-teal/40 bg-signal-teal/10",
} as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-24 pb-14 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-32"
    >
      <div className="hex-grid-overlay pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-signal-violet/25 blur-[90px] animate-float-slow sm:h-72 sm:w-72 sm:blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-10 h-60 w-60 rounded-full bg-signal-cyan/20 blur-[90px] animate-float sm:h-80 sm:w-80 sm:blur-[110px]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:gap-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>

          <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:mt-6 sm:text-5xl lg:text-6xl">
            The science of today
            <br />
            is the technology of <span className="text-gradient">Tomorrow</span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-muted sm:mt-6 sm:text-lg">
            {SITE.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
            <a
              href="#journey"
              className="group inline-flex items-center gap-2 rounded-full bg-signal-violet px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3.5"
            >
              Jelajahi Profil Kami
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#prestasi"
              className="inline-flex items-center gap-2 rounded-full border border-space-line px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan sm:px-6 sm:py-3.5"
            >
              Lihat Prestasi
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col gap-3 sm:gap-4">
          {DIVISIONS.map((division, i) => (
            <div
              key={division.id}
              style={{ animationDelay: `${i * 0.4}s` }}
              className={`glass-panel animate-float-slow flex items-start gap-4 rounded-2xl p-4 sm:p-5 ${
                i === 1 ? "sm:ml-8" : i === 2 ? "sm:mr-6" : ""
              }`}
            >
              <span
                className={`hex-frame relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border sm:h-12 sm:w-12 ${DIVISION_COLOR[division.accent]}`}
              >
                <ImageWithSkeleton
                  src={division.logo}
                  alt={`Logo divisi ${division.name}`}
                  fill
                  sizes="48px"
                  className="object-cover p-1.5"
                />
              </span>
              <div>
                <h3 className="font-display text-sm font-semibold text-ink sm:text-base">
                  {division.name}
                </h3>
                <p className="mt-1 text-xs leading-snug text-ink-muted sm:text-sm">
                  {division.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}