"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type BannerSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  desc: string;
  meta?: string;
  tag?: string;
  img: string;
  link?: string;
  cta?: string;
};

export default function FullHeightSlider({ items, fallbackCta = "Learn more" }: { items: BannerSlide[]; fallbackCta?: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = items.length;
  const go = useCallback((n: number) => setI((p) => (p + n + len) % len), [len]);

  useEffect(() => {
    if (!len) return;
    if (i >= len) setI(0);
  }, [len, i]);

  useEffect(() => {
    if (paused || len <= 1) return;
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [paused, go, len]);

  if (!len) return null;
  const s = items[i] ?? items[0];
  const ctaLabel = s.cta || fallbackCta;

  return (
    <section
      aria-label="Highlights"
      className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden bg-[#1a1a16]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* full viewport minus sticky nav (~64px) */}
      <div className="relative h-[calc(100vh-64px)] min-h-[520px] sm:min-h-[560px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt={s.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-[#2D4A22]/10 mix-blend-multiply" />

            {/* content — centered vertically, roomy */}
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="w-full mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 py-10 sm:py-0 pb-16 sm:pb-0">
                <div className="max-w-[640px]">
                  {(s.eyebrow || s.tag) && (
                    <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-[0.18em] text-white backdrop-blur border border-white/15">
                      {s.eyebrow ?? s.tag}
                    </p>
                  )}
                  {s.meta && <p className="mt-3 text-[11px] tracking-[0.12em] text-white/70">{s.meta}</p>}
                  <h2 className="mt-3 sm:mt-4 font-[var(--font-display)] text-[28px] sm:text-[40px] md:text-[52px] font-light leading-[0.9] text-white break-words">
                    {s.title}
                  </h2>
                  <p className="mt-3 sm:mt-4 max-w-[50ch] text-[13px] sm:text-[15px] leading-6 sm:leading-7 text-white/80">{s.desc}</p>
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 sm:px-7 py-3 sm:py-3.5 text-[11px] tracking-[0.14em] text-[#2D4A22] transition hover:bg-[#FFFCF2]"
                    >
                      {ctaLabel} <span>↗</span>
                    </a>
                  ) : (
                    <span className="mt-6 sm:mt-8 inline-flex rounded-full bg-white/15 border border-white/20 px-6 py-3 text-[11px] tracking-[0.14em] text-white backdrop-blur">
                      {ctaLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* arrows */}
        {len > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={() => go(-1)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={() => go(1)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white"
            >
              ›
            </button>
          </>
        )}

        {/* dots + counter */}
        {len > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-[11px] tracking-[0.12em] text-white/70">
              {String(i + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
