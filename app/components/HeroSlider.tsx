"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Pencil } from "lucide-react";
import { useLang } from "../i18n";
import { isAuthed } from "../lib/auth";
import HeroSliderEditModal from "./HeroSliderEditModal";

const FALLBACK_VIDEO_SRC = "https://cdn.alvineitsolutions.com/naturafoods/Video%20Home%20Website%20(1).mp4";
const FALLBACK_VIDEO_POSTER = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80";
const CTA_ID = "contact";

export default function HeroSlider({ onCta, welcome: _welcome }: { onCta?: (id: string) => void; welcome?: { title: string; sub: string } }) {
  void _welcome;
  const { t } = useLang();
  const videoSrc = t.heroVideoSrc || FALLBACK_VIDEO_SRC;
  const videoPoster = t.heroVideoPoster || FALLBACK_VIDEO_POSTER;
  const title = `${t.bannerTitle1} ${t.bannerTitleItalic} ${t.bannerTitle3}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [authed, setAuthed] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onPlay = () => setVideoReady(true);
    el.addEventListener("playing", onPlay);
    el.play().catch(() => {});
    return () => el.removeEventListener("playing", onPlay);
  }, []);

  useEffect(() => {
    setAuthed(isAuthed());
    const onChange = () => setAuthed(isAuthed());
    window.addEventListener("storage", onChange);
    window.addEventListener("nf_auth_changed" as never, onChange as never);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("nf_auth_changed" as never, onChange as never);
    };
  }, []);

  const handleCta = () => {
    if (onCta) onCta(CTA_ID);
    else document.getElementById(CTA_ID)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      aria-label="Highlights"
      className="w-full"
    >
      <div className="relative overflow-hidden bg-[#1a1a16] min-h-[90vh]">
        <div className="relative h-[90vh] min-h-[640px]">
          {/* video background */}
          {/* poster — visible until video starts playing */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={videoPoster}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-0" : "opacity-100"}`}
          />
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-0 bg-[#2D4A22]/10 mix-blend-multiply" />

          {/* welcome badge */}
          {/* {welcome && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-6 sm:top-8 md:top-10 -translate-x-1/2 z-10 max-w-[92%] text-center"
            >
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.28em] text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5EFE0]" />
                {welcome.title}
              </p>
              <p className="mt-2 hidden sm:block text-[11px] sm:text-[12px] leading-5 text-white/80">{welcome.sub}</p>
            </motion.div>
          )} */}

          {/* content overlay */}
          <div className="absolute inset-0 flex items-end sm:items-center p-4 sm:p-16 md:p-16 lg:p-20">
            <div className="max-w-[560px]">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex rounded-full bg-white/15 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.18em] text-white backdrop-blur"
              >
                {t.bannerEyebrow}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 sm:mt-4 whitespace-pre-line font-[var(--font-display)] text-[26px] sm:text-[30px] md:text-[44px] lg:text-[48px] font-light leading-[0.95] text-white"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 sm:mt-3 max-w-[42ch] text-[13px] sm:text-[14px] leading-6 text-white/80"
              >
                {t.bannerDesc}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleCta}
                className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-[11px] tracking-[0.14em] text-[#2D4A22] transition hover:bg-white"
              >
                {t.heroBannerCta} <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>

          {authed && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Edit HeroSlider"
              className="group absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] tracking-[0.16em] text-[#2D4A22] shadow-md backdrop-blur transition hover:bg-white sm:right-5 sm:top-5"
            >
              <Pencil className="h-3 w-3" />
              <span>EDIT</span>
            </button>
          )}
        </div>
      </div>
      <HeroSliderEditModal open={editOpen} onClose={() => setEditOpen(false)} />
    </section>
  );
}
