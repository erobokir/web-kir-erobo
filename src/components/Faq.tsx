"use client";

import { useState } from "react";
import { FAQ } from "@/data/content";
import { IconPlus } from "@/components/icons";

export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(FAQ[0]?.id ?? null);

  return (
    <section id="faq" className="relative border-t border-space-line py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <span className="eyebrow text-signal-cyan">FAQ</span>
          <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            Pertanyaan yang Sering Ditanyakan
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ.map((item) => {
            const isOpen = item.id === openId;
            return (
              <div
                key={item.id}
                className="glass-panel overflow-hidden rounded-2xl"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium text-ink">{item.question}</span>
                  <IconPlus
                    className={`h-4 w-4 shrink-0 text-signal-cyan transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-ink-muted">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}