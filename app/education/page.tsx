"use client";
import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import FullHeightSlider from "../components/FullHeightSlider";
import { useLang } from "../i18n";
import { SEED_EDU } from "../lib/data";
import type { Edu } from "../lib/data";

export default function EducationPage() {
  const { t } = useLang();
  const p = t.eduPage;
  const [items, setItems] = useState<Edu[]>(SEED_EDU);
  useEffect(() => { try { const v = localStorage.getItem("nf_edu"); if (v) setItems(JSON.parse(v)); } catch {} }, []);
  const slides = items.map((e) => ({
    id: e.id,
    eyebrow: e.eyebrow ?? `${e.level} · ${e.duration}`,
    title: e.title,
    desc: e.desc,
    meta: `${p.level}: ${e.level}  ·  ${e.duration}`,
    img: e.img,
    link: e.link,
    cta: e.cta,
  }));
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteNav />
      {/* header overlayed for full-height feel, but keep readable: slight band */}
      {/* <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        <p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{p.eyebrow}</p>
        <h1 className="mt-2 font-[var(--font-display)] text-[26px] sm:text-[32px] md:text-[40px] font-light leading-none text-[#2D4A22]">{p.title}</h1>
        <p className="mt-3 max-w-[60ch] text-[13px] leading-6 text-[#1a1a16]/60">{p.desc}</p>
      </div> */}
      <div>
        {slides.length === 0 ? (
          <p className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 py-16 text-center text-[13px] text-[#8B6F47]">{t.admin.noData}</p>
        ) : (
          <FullHeightSlider items={slides} fallbackCta={p.join} />
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
