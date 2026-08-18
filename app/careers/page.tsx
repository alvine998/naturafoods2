"use client";
import SiteNav from "../components/SiteNav";
import { Breadcrumbs } from "../components/PageShell";
import SiteFooter from "../components/SiteFooter";
import { useLang } from "../i18n";

export default function CareersPage() {
  const { t } = useLang();
  const p = t.careersPage;
  // ponytail: change href to company-specific Glints URL when available
  const GLINTS_URL = "https://glints.com";
  return (
    <div className="min-h-screen bg-[#FFFCF2] overflow-x-hidden">
      <SiteNav />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 pt-6"><Breadcrumbs items={[{ label: "Careers" }]} /></div>
      <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f19d?w=1600&q=80"
          alt="NaturaFoods careers"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a1a16]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a16]/40 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-[720px] px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-[10px] tracking-[0.28em] text-white/70 sm:text-[11px]">{p.eyebrow}</p>
          <h1 className="mt-4 font-[var(--font-display)] text-[32px] font-light leading-[0.9] text-white sm:text-[44px] md:text-[56px] break-words">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 sm:mt-6 max-w-[48ch] text-[13px] leading-6 text-white/75 sm:text-[14px] sm:leading-7">
            {p.desc}
          </p>
          <a
            href={GLINTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[11px] tracking-[0.16em] text-[#2D4A22] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:bg-[#FFFCF2] sm:mt-10 sm:px-10 sm:py-4 sm:text-[12px]"
          >
            {p.apply} <span>↗</span>
          </a>
          <p className="mt-4 text-[11px] tracking-[0.12em] text-white/50">via Glints</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
