"use client";
import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import FullHeightSlider from "../components/FullHeightSlider";
import { useLang } from "../i18n";
import { SEED_INNOVATION } from "../lib/data";
import type { Innovation } from "../lib/data";

export default function InnovationPage() {
  const { t } = useLang();
  const p = t.innovPage;
  const [items, setItems] = useState<Innovation[]>(SEED_INNOVATION);
  useEffect(() => { try { const v = localStorage.getItem("nf_innovation"); if (v) setItems(JSON.parse(v)); } catch {} }, []);
  const slides = items.map((it) => ({
    id: it.id,
    eyebrow: it.eyebrow ?? it.tag,
    title: it.title,
    desc: it.desc,
    meta: it.tag,
    img: it.img,
    link: it.link,
    cta: it.cta,
  }));
  return (
    <div className="min-h-screen bg-[#FFFCF2] overflow-x-hidden">
      <SiteNav />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        <p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{p.eyebrow}</p>
        <h1 className="mt-2 font-[var(--font-display)] text-[26px] sm:text-[32px] md:text-[40px] font-light leading-none text-[#2D4A22]">{p.title}</h1>
        <p className="mt-3 max-w-[60ch] text-[13px] leading-6 text-[#1a1a16]/60">{p.desc}</p>
      </div>
      <div className="mt-6 sm:mt-8">
        {slides.length === 0 ? (
          <p className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 py-16 text-center text-[13px] text-[#8B6F47]">{t.admin.noData}</p>
        ) : (
          <FullHeightSlider items={slides} fallbackCta={t.homeCommon.viewMore} />
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
