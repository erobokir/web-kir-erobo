import Image from "next/image";
import { NAV_LINKS, SITE } from "@/data/content";
import { IconInstagram, IconMail, IconMapPin } from "@/components/icons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-space-line py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#home" className="flex items-center gap-3">
              <Image
                src="/images/brand/logo-kir.png"
                alt="Logo KIR EROBO"
                width={34}
                height={34}
                className="hex-clip object-cover"
              />
              <span className="font-display text-sm font-bold text-ink">
                {SITE.name}
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              &ldquo;Inovasi hari ini, solusi untuk esok hari.&rdquo;
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4 text-ink-dim">Navigasi</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-ink-dim">Hubungi Kami</p>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              <li className="flex items-center gap-2">
                <IconInstagram className="h-4 w-4 shrink-0" />
                <a href={SITE.instagram} className="transition-colors hover:text-ink">
                  @eroboofficial
                </a>
              </li>
              <li className="flex items-center gap-2">
                <IconMail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-ink">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-ink-dim">Temukan Kami</p>
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
              <IconMapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {SITE.address}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-space-line pt-6 text-xs text-ink-dim sm:flex-row">
          <p>© {year} {SITE.name}. Kelompok Ilmiah Remaja. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}