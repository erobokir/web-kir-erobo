import { IconTrophy } from "@/components/icons";
import type { MarqueeRow } from "@/types";

interface MarqueeLineProps {
  items: MarqueeRow;
  reverse?: boolean;
}

function MarqueeLine({ items, reverse = false }: MarqueeLineProps) {
  const content = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max shrink-0 items-center gap-4 sm:gap-8 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {content.map((text, i) => (
          <div key={i} className="flex shrink-0 items-center gap-4 sm:gap-8">
            <span className="font-display text-xs font-semibold uppercase tracking-wide text-ink-muted sm:text-lg lg:text-xl">
              {text}
            </span>
            <IconTrophy className="h-3 w-3 shrink-0 text-signal-gold sm:h-4 sm:w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface DoubleMarqueeProps {
  rowOne: MarqueeRow;
  rowTwo: MarqueeRow;
  className?: string;
}

export default function DoubleMarquee({ rowOne, rowTwo, className = "" }: DoubleMarqueeProps) {
  return (
    <div
      className={`marquee-pause marquee-fade sticky top-16 z-40 space-y-2.5 border-y border-space-line bg-space/85 py-2.5 backdrop-blur-md sm:top-20 sm:space-y-4 sm:py-4 ${className}`}
    >
      <MarqueeLine items={rowOne} />
      {/* <MarqueeLine items={rowTwo} reverse /> */}
    </div>
  );
}