"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

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
      {/* full viewport minus sticky nav (~64px) — use dvh/svh for mobile browser chrome */}
      <div className="relative min-h-[520px] h-[calc(100svh-64px)] supports-[height:100dvh]:h-[calc(100dvh-64px)] sm:h-[calc(100vh-64px)] sm:min-h-[560px] max-h-[760px] sm:max-h-[860px] [@media(max-height:500px)]:min-h-[420px] [@media(max-height:500px)]:h-[calc(100dvh-56px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {s.img?.startsWith("data:video") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(s.img ?? "") ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={s.img} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover object-center" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.img} alt={s.title} className="h-full w-full object-cover object-center" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 sm:from-black/75 sm:via-black/25" />
            <div className="absolute inset-0 bg-[#2D4A22]/10 mix-blend-multiply" />

            {/* content — bottom on mobile (thumb reach), centered on sm+ */}
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="w-full mx-auto max-w-[1280px] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 sm:px-6 md:px-8 sm:py-0 sm:pb-0">
                <div className="max-w-[640px]">
                  {(s.eyebrow || s.tag) && (
                    <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-[0.18em] text-white backdrop-blur border border-white/15">
                      {s.eyebrow ?? s.tag}
                    </p>
                  )}
                  {s.meta && <p className="mt-3 text-[11px] tracking-[0.12em] text-white/70">{s.meta}</p>}
                  <h2 className="mt-3 sm:mt-4 font-[var(--font-display)] text-[28px] font-light leading-[0.94] tracking-[-0.02em] text-white break-words [text-wrap:balance] min-[375px]:text-[30px] sm:text-[40px] md:text-[52px]">
                    {s.title}
                  </h2>
                  <p className="mt-3 sm:mt-4 max-w-[50ch] text-[14px] leading-6 text-white/85 [text-wrap:pretty] sm:text-[15px] sm:leading-7">{s.desc}</p>
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 sm:mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[11px] font-medium tracking-[0.14em] text-[#2D4A22] shadow-lg transition hover:bg-white active:scale-[0.98] sm:w-auto sm:justify-start sm:px-7 sm:py-3.5 sm:shadow-none"
                    >
                      {ctaLabel} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="mt-5 sm:mt-8 inline-flex min-h-11 items-center rounded-full bg-white/15 border border-white/20 px-6 py-3 text-[11px] tracking-[0.14em] text-white backdrop-blur">
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
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next"
              onClick={() => go(1)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* dots + counter — lift for safe-area on mobile + above CTA */}
        {len > 1 && (
          <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
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
