import { GALLERY } from "@/data/content";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

export default function Gallery() {
  const track = [...GALLERY, ...GALLERY];

  return (
    <section className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="eyebrow text-signal-teal">Dokumentasi Kegiatan</span>
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Momen di Balik Setiap Proyek
          </h2>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden sm:mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-space to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-space to-transparent sm:w-32" />

        <div className="marquee-track gap-4 px-5 sm:gap-5">
          {track.map((image, i) => (
            <div
              key={`${image.id}-${i}`}
              className="relative h-44 w-60 shrink-0 overflow-hidden rounded-2xl border border-space-line sm:h-64 sm:w-80"
            >
              <ImageWithSkeleton
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 240px, 320px"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-space/70 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}