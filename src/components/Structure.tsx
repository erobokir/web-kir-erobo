import { STRUCTURE } from "@/data/content";
import { IconUsers } from "@/components/icons";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

export default function Structure() {
  return (
    <section id="struktur" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="text-center">
          <span className="eyebrow text-signal-violet">Struktur Pengurus</span>
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Tim di Balik KIR EROBO
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Periode kepengurusan 2026/2027, digerakkan oleh anggota lintas
            angkatan yang menjaga KIR tetap aktif dan berkembang.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 sm:mt-16">
          {STRUCTURE.map((tier, tierIndex) => (
            <div key={tier.id} className="flex w-full flex-col items-center">
              {tierIndex > 0 && (
                <span className="h-8 w-px bg-space-line" aria-hidden />
              )}
              <p className="eyebrow mb-4 text-ink-dim">{tier.label}</p>
              <div className="flex w-full flex-wrap justify-center gap-5 sm:gap-8">
                {tier.members.map((member) => (
                  <div key={member.id} className="flex w-32 flex-col items-center text-center sm:w-44">
                    <span className="hex-frame relative flex h-24 w-24 items-center justify-center overflow-hidden border border-signal-violet/40 bg-space-panel sm:h-32 sm:w-32">
                      {member.photo ? (
                        <ImageWithSkeleton
                          src={member.photo}
                          alt={member.name}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : (
                        <IconUsers className="h-9 w-9 text-ink-dim sm:h-10 sm:w-10" />
                      )}
                    </span>
                    <p className="mt-3 text-xs font-medium leading-snug text-ink sm:text-sm">
                      {member.name}
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-ink-muted sm:text-xs">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}