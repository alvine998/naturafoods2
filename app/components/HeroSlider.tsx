"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Slide = {
  type: "image" | "video";
  src: string;
  poster?: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  ctaId: string;
};

// ponytail: add/edit slides here. video src can be /public file or remote mp4.
const SLIDES: Slide[] = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=1600&q=80",
    eyebrow: "BELGIAN COUVERTURE · NEW HARVEST",
    title: "Chocolate that\ntempers every time.",
    desc: "Direct from Belgium & Ecuador — callets for drinks, ganache & moulding.",
    cta: "VIEW CHOCO",
    ctaId: "choco",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1600&q=80",
    eyebrow: "UJI & YAME · STONE-MILLED · COLD-CHAIN",
    title: "Matcha, properly\nstored in Jakarta.",
    desc: "Nitrogen-sealed from Uji — ceremonial to culinary, ready in 48h.",
    cta: "VIEW MATCHA",
    ctaId: "matcha",
  },
  {
    type: "video",
    // demo video — replace with /videos/hero.mp4 in public/ if you have one
    src: "https://videos.pexels.com/video-files/29068399/12641618_1920_1080_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80",
    eyebrow: "FROM ORIGIN TO CUP — 400+ PARTNERS",
    title: "Supply that keeps\nthe ritual consistent.",
    desc: "We hold stock so you don't chase imports. Samples & barista training.",
    cta: "BECOME A PARTNER",
    ctaId: "contact",
  },
];

export default function HeroSlider({ onCta, slides }: { onCta?: (id: string) => void; slides?: Slide[] }) {
  const SLIDES_ACTIVE = slides ?? SLIDES;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setI((p) => (p + n + SLIDES_ACTIVE.length) % SLIDES_ACTIVE.length), [SLIDES_ACTIVE.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 4500);
    return () => clearInterval(t);
  }, [paused, go]);

  const s = SLIDES_ACTIVE[i] ?? SLIDES_ACTIVE[0];
  // clamp index when locale changes and slides length differs
  useEffect(() => { if (i >= SLIDES_ACTIVE.length) setI(0); }, [SLIDES_ACTIVE.length, i]);

  const handleCta = () => {
    if (onCta) onCta(s.ctaId);
    else document.getElementById(s.ctaId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      aria-label="Highlights"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[28px] bg-[#1a1a16]">
        {/* slides */}
        <div className="relative h-[380px] sm:h-[420px] md:h-[480px] lg:h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {s.type === "video" ? (
                <video
                  key={s.src}
                  src={s.src}
                  poster={s.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.src} alt={s.title.replace("\n"," ")} className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <div className="absolute inset-0 bg-[#2D4A22]/10 mix-blend-multiply" />

              {/* content */}
              <div className="absolute inset-0 flex items-end sm:items-center p-4 sm:p-6 md:p-10 lg:p-14">
                <div className="max-w-[560px]">
                  <p className="inline-flex rounded-full bg-white/15 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.18em] text-white backdrop-blur">
                    {s.eyebrow}
                  </p>
                  <h2 className="mt-3 sm:mt-4 whitespace-pre-line font-[var(--font-display)] text-[26px] sm:text-[30px] md:text-[44px] lg:text-[48px] font-light leading-[0.95] text-white">
                    {s.title}
                  </h2>
                  <p className="mt-2 sm:mt-3 max-w-[42ch] text-[13px] sm:text-[14px] leading-6 text-white/80">{s.desc}</p>
                  <button
                    onClick={handleCta}
                    className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-[11px] tracking-[0.14em] text-[#2D4A22] transition hover:bg-[#FFFCF2]"
                  >
                    {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* arrows */}
        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* dots */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES_ACTIVE.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
