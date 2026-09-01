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
    // reset poster visibility when source changes (poster -> video transition)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on source change
    setVideoReady(false);
    const el = videoRef.current;
    if (!el) return;
    const markReady = () => setVideoReady(true);
    // handle cases where autoplay is blocked (Low Power Mode) — keep poster visible
    el.addEventListener("playing", markReady);
    el.addEventListener("canplay", () => {
      // if already enough data and not paused, consider ready
      if (!el.paused && el.readyState >= 3) markReady();
    });
    // attempt autoplay; ignore failure (mobile data saver / low power)
    const tryPlay = () => el.play().catch(() => {});
    tryPlay();
    // retry on visibility return (iOS pauses offscreen videos)
    const onVis = () => {
      if (document.visibilityState === "visible" && el.paused) tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      el.removeEventListener("playing", markReady);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [videoSrc]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync auth from localStorage
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
      <div className="relative overflow-hidden bg-[#1a1a16]">
        {/* Mobile: fill dynamic viewport minus sticky nav (64px), clamp to avoid too tall/small.
            svh = stable viewport, dvh = dynamic viewport for iOS/Android chrome handling.
            sm+ restores 90vh hero with larger min heights. */}
        <div className="relative min-h-[520px] h-[calc(100svh-64px)] max-h-[760px] supports-[height:100dvh]:h-[calc(100dvh-64px)] sm:h-[90vh] sm:min-h-[640px] sm:max-h-[860px] lg:min-h-[680px] [@media(max-height:500px)]:min-h-[440px] [@media(max-height:500px)]:h-[calc(100dvh-56px)] [@media(max-height:500px)]:max-h-none">
          {/* video background */}
          {/* poster — visible until video starts playing */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={videoPoster}
            alt=""
            aria-hidden="true"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-0" : "opacity-100"}`}
          />
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            poster={videoPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* stronger bottom gradient on mobile for legibility when content is items-end */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 sm:from-black/70 sm:via-black/20" />
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

          {/* content overlay — bottom-aligned on mobile for thumb reach + readability, centered on sm+ */}
          <div className="absolute inset-0 flex items-end sm:items-center">
            <div className="w-full mx-auto max-w-[1280px] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-12 sm:px-10 sm:pb-0 sm:pt-0 md:px-16 lg:px-20">
              <div className="max-w-[560px] sm:max-w-[600px]">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] tracking-[0.18em] text-white backdrop-blur"
                >
                  {t.bannerEyebrow}
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 whitespace-pre-line font-[var(--font-display)] text-[30px] font-light leading-[0.94] tracking-[-0.02em] text-white [text-wrap:balance] min-[375px]:text-[32px] sm:mt-4 sm:text-[36px] md:text-[44px] lg:text-[52px]"
                >
                  {title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 max-w-[42ch] text-[14px] leading-6 text-white/85 [text-wrap:pretty] sm:mt-3 sm:text-[15px] sm:leading-7"
                >
                  {t.bannerDesc}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  onClick={handleCta}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[11px] font-medium tracking-[0.14em] text-[#2D4A22] shadow-lg transition hover:bg-white active:scale-[0.98] sm:mt-6 sm:w-auto sm:justify-start sm:px-7 sm:py-3 sm:shadow-none"
                >
                  {t.heroBannerCta} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </motion.button>
              </div>
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
