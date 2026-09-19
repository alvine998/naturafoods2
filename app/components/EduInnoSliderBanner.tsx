"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../lib/store";

type SlideItem = {
  id: string;
  title: string;
  img: string;
  link?: string;
};

function SkeletonBanner() {
  return (
    <div className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden">
      <div className="w-full aspect-video bg-[#F5EFE0] animate-pulse">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 md:px-8 h-full flex items-end sm:items-center pb-6 sm:pb-0">
          <div className="max-w-[600px] space-y-2 sm:space-y-4">
            <div className="h-5 sm:h-7 w-32 rounded-full bg-[#2D4A22]/10" />
            <div className="h-7 sm:h-12 w-44 sm:w-64 rounded-lg bg-[#2D4A22]/10" />
            <div className="h-4 w-80 rounded bg-[#2D4A22]/8 max-sm:hidden" />
            <div className="h-11 w-40 rounded-full bg-[#2D4A22]/10 max-sm:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSlider({ items, ready }: { items: SlideItem[]; ready: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = items.length;
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

  if (!ready) return <SkeletonBanner />;
  if (!len) return null;

  const slide = items[current];
  if (!slide) return null;

  const openLink = () => {
    if (!slide.link) return;
    if (slide.link.startsWith("/")) window.location.href = slide.link;
    else window.open(slide.link, "_blank", "noopener,noreferrer");
  };

  return (
    <section
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
            className={`relative w-full${slide.link ? " cursor-pointer" : ""}`}
            onClick={slide.link ? openLink : undefined}
            role={slide.link ? "link" : undefined}
            tabIndex={slide.link ? 0 : undefined}
            aria-label={slide.link ? slide.title : undefined}
            onKeyDown={
              slide.link
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openLink();
                    }
                  }
                : undefined
            }
          >
            {(() => {
              const src = slide.img?.trim() ? slide.img : null;
              const isVideo = !!src && (src.startsWith("data:video") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src));
              if (!src) {
                return (
                  <div className="grid min-h-[320px] sm:min-h-[400px] md:min-h-[480px] w-full place-items-center bg-[#F5EFE0] text-[11px] tracking-[0.14em] text-[#8B6F47]">
                    {slide.title}
                  </div>
                );
              }
              return isVideo ? (
                <video src={src} autoPlay muted loop playsInline preload="metadata" className="block h-auto w-full bg-white" />
              ) : (
                <img src={src} alt={slide.title} className="block h-auto w-full bg-white" />
              );
            })()}
          </motion.div>
        </AnimatePresence>

        {len > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#2D4A22] backdrop-blur shadow hover:bg-white transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next"
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
              {items.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
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
  );
}

export default function EduInnoSliderBanner() {
  const { ready, edu, innovation } = useStore();

  const eduSlides: SlideItem[] = edu.map((e) => ({
    id: `edu-${e.id}`,
    title: e.title,
    img: e.img,
    link: e.link,
  }));

  const innoSlides: SlideItem[] = innovation.map((i) => ({
    id: `inno-${i.id}`,
    title: i.title,
    img: i.img,
    link: i.link,
  }));

  const showEdu = ready ? eduSlides.length > 0 : true;
  const showInno = ready ? innoSlides.length > 0 : true;

  return (
    <>
      {showEdu && (
        <div className="mb-10 sm:mb-14">
          <HeroSlider items={eduSlides} ready={ready} />
        </div>
      )}

      {showInno && (
        <div className="mb-10 sm:mb-14">
          <HeroSlider items={innoSlides} ready={ready} />
        </div>
      )}
    </>
  );
}
