import { SITE } from "@/data/content";
import { IconArrowRight } from "@/components/icons";

const CONTACT_WA_URL =
  "https://wa.me/628568435320?text=Halo%20kak%20Safa%20aku%20mau%20tanya%20tentang%20pendaftaran%20kir%20dong";

export default function JoinCta() {
  return (
    <section id="gabung" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="hex-grid-overlay glass-panel relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16 lg:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-violet/30 blur-[100px]"
          />
          <span className="eyebrow text-signal-teal">Gabung Bersama Kami</span>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Punya Ide? Ingin Berinovasi?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Saatnya jadi bagian dari perjalanan besar ini. Open recruitment
            akan segera dibuka untuk seluruh peserta didik {SITE.school}.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              // href={SITE.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-signal-violet px-8 py-4 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Coming Soon
              {/* <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /> */}
            </a>

            <a
              href={CONTACT_WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-space-line px-6 py-4 text-sm font-medium text-ink transition-colors hover:border-signal-teal/50 hover:text-signal-teal"
            >
              Hubungi Contact Person
            </a>
          </div>

          <p className="mt-4 text-xs text-ink-dim">
            Ada pertanyaan seputar pendaftaran? Chat kak Safa langsung via WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}