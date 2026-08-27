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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteNav />
      <div>
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
