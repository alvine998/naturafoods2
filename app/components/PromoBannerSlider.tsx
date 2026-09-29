"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "./SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isActivePromoBanner, sortByLandingOrder, useStore } from "../lib/store";
import type { PromoBanner } from "../lib/data";

function PromoCaption({ banner }: { banner: PromoBanner }) {
  const name = banner.name?.trim() ?? "";
  const desc = banner.description?.trim() ?? "";
  if (!name && !desc) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-5 pb-12 pt-16 sm:px-8 sm:pb-14">
      <div className="mx-auto max-w-[1280px]">
        {name && (
          <p className="max-w-[32ch] font-[var(--font-display)] text-[22px] font-light leading-tight text-white sm:text-[30px]">
            {name}
          </p>
        )}
        {desc && <p className="mt-2 max-w-[52ch] text-[12px] leading-5 text-white/80 sm:text-[13px]">{desc}</p>}
      </div>
    </div>
  );
}

function PromoMedia({ banner }: { banner: PromoBanner }) {
  const src = banner.image?.trim() ? banner.image.trim() : null;
  if (!src) {
    return (
      <div className="grid min-h-[220px] sm:min-h-[320px] md:min-h-[380px] w-full place-items-center bg-[#F5EFE0] px-6 text-center">
        <div>
          <p className="font-[var(--font-display)] text-[20px] font-light text-[#2D4A22]">{banner.name}</p>
          {banner.description && <p className="mt-2 text-[12px] text-[#8B6F47]">{banner.description}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full">
      <Image src={src} alt={banner.name || "Promo banner"} width={1600} height={900} sizes="100vw" className="block h-auto w-full bg-white" />
      <PromoCaption banner={banner} />
    </div>
  );
}

/**
 * Promo banner for the top of the education section on Home.
 * - 0 active banners → renders nothing.
 * - 1 active banner → single static banner.
 * - >1 active banners → auto slider (same UX as the education slider).
 */
export default function PromoBannerSlider() {
  const { ready, promoBanners } = useStore();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const active = useMemo(
    () => sortByLandingOrder((promoBanners ?? []).filter(isActivePromoBanner)),
    [promoBanners]
  );
  const len = active.length;
  const go = useCallback((n: number) => setCurrent((p) => (p + n + len) % len), [len]);

  useEffect(() => {
    if (len === 0) return;
    setCurrent((prev) => (prev >= len ? 0 : prev));
  }, [len]);

  useEffect(() => {
    if (paused || len <= 1) return;
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [paused, go, len]);

  // While the store is hydrating, paint cached banners immediately (if any).
  // Render nothing when there is nothing to show — no skeleton flash.
  void ready;
  if (!len) return null;

  const slide = active[current];
  if (!slide) return null;

  return (
    <div className="mb-10 sm:mb-14">
    <section
      aria-label="Promotion"
      className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <PromoMedia banner={slide} />
          </motion.div>
        </AnimatePresence>

        {len > 1 && (
          <>
            <button
              aria-label="Previous promotion"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next promotion"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {len > 1 && (
          <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              {active.map((b, idx) => (
                <button
                  key={b.id || idx}
                  aria-label={`Go to promotion ${idx + 1}`}
                  onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                  className={`h-1.5 rounded-full transition-all ${idx === current ? "w-8 bg-[#2D4A22]" : "w-1.5 bg-[#2D4A22]/25 hover:bg-[#2D4A22]/50"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-[11px] tracking-[0.12em] text-[#2D4A22]/60">
              {String(current + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </section>
    </div>
  );
}
