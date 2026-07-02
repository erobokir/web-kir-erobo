import { JOURNEY } from "@/data/content";

export default function JourneyTimeline() {
  return (
    <section id="journey" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-center">
          <span className="eyebrow text-signal-cyan">The Journey</span>
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Perjalanan yang Membentuk Kami
          </h2>
        </div>

        <ol className="relative mt-16 space-y-10 border-l border-space-line pl-8 sm:pl-10">
          {JOURNEY.map((step) => (
            <li key={step.id} className="relative">
              <span className="hex-frame absolute -left-[3.05rem] top-0 flex h-11 w-11 items-center justify-center border border-signal-violet/40 bg-space-panel font-mono text-xs font-semibold text-signal-violet sm:-left-[3.55rem]">
                {step.index}
              </span>
              <p className="eyebrow text-ink-dim">{step.year}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}