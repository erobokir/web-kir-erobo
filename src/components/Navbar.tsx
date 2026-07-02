"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/data/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-space/80 backdrop-blur-md border-b border-space-line" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <Image
              src="/images/brand/logo-kir.png"
              alt="Logo KIR EROBO"
              width={36}
              height={36}
              className="hex-clip object-cover"
              priority
            />
          </span>
          <span className="font-display text-sm font-bold tracking-wide text-ink">
            KIR
            <span className="block -mt-1 text-[0.6rem] font-normal tracking-[0.18em] text-ink-muted">
              EROBO
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#gabung"
            className="rounded-full border border-signal-violet/50 bg-signal-violet/10 px-5 py-2 text-sm font-medium text-ink transition-all hover:bg-signal-violet/25 hover:shadow-glow"
          >
            Daftar
          </a>
        </div>

        <button
          aria-label="Buka menu navigasi"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-space-line bg-space/95 px-5 pb-6 pt-2 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-ink-muted transition-colors hover:bg-space-panel hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#gabung"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-signal-violet px-5 py-3 text-center text-sm font-medium text-white"
            >
              Daftar di {SITE.name}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}