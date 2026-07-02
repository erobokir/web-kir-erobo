import { STATS } from "@/data/content";

export default function About() {
  return (
    <section id="tentang" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="eyebrow text-signal-teal">Tentang Kami</span>
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Wadah Riset dan Inovasi untuk Remaja
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">
            KIR EROBO merupakan organisasi yang bergerak di bidang penelitian
            dan pengembangan ilmu pengetahuan serta teknologi. Berawal dari
            sekumpulan siswa yang aktif di lomba-lomba ilmiah, KIR kini
            berkembang menjadi rumah bagi tiga divisi AI, Rekayasa
            Teknologi, dan Science yang saling melengkapi dalam melahirkan
            karya nyata.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Selain riset dan eksperimen, KIR juga jadi tempat membangun
            relasi, melatih kerja sama tim, dan berpikir kritis lewat setiap
            proyek yang dikerjakan bersama.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="glass-panel rounded-2xl p-6 text-center transition-transform hover:-translate-y-1"
            >
              <p className="font-display text-2xl font-extrabold text-gradient sm:text-3xl lg:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}