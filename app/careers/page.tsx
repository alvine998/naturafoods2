"use client";
import { ArrowUpRight, Briefcase } from "lucide-react";
import Link from "next/link";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

const CAREERS = {
  en: {
    eyebrow: "CAREERS",
    titleA: "Be a Part of",
    titleB: "PT Natura Inti Sukses",
    desc: "We believe people are our greatest asset. We create a supportive workplace where talent can grow, learn, and make a real impact on millions of people.",
    cta: "View Openings on Glints",
    via: "via Glints",
    growTitle: "Let's Grow Together",
    growDesc: "Join us and become part of a family that keeps growing and brings goodness to many people.",
    growCta: "Lihat Lowongan di Glints",
  },
  id: {
    eyebrow: "KARIR",
    titleA: "Jadilah Bagian dari",
    titleB: "PT Natura Inti Sukses",
    desc: "Kami percaya sumber daya manusia adalah aset terbesar kami. Kami menciptakan tempat kerja yang suportif agar talenta dapat tumbuh, belajar, dan memberi dampak nyata bagi jutaan orang.",
    cta: "Lihat Lowongan di Glints",
    via: "via Glints",
    growTitle: "Mari Tumbuh Bersama",
    growDesc: "Bergabunglah bersama kami dan jadi bagian dari keluarga yang terus bertumbuh serta membawa kebaikan bagi banyak orang.",
    growCta: "Lihat Lowongan di Glints",
  },
} as const;

export default function CareersPage() {
  // ponytail: change href to company-specific Glints URL when available
  const GLINTS_URL = "https://glints.com";
  const copy = CAREERS.en;
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-0 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-6 md:px-8 md:py-10">
          {/* Left: green panel */}
          <div className="relative overflow-hidden rounded-[20px] bg-[#2D4A22] p-6 text-white shadow-[0_18px_50px_rgba(45,74,34,0.18)] sm:p-8 md:p-10">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/[0.04]" />

            <div className="relative flex h-full flex-col">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-white/85 sm:text-[11px]">
                {copy.eyebrow}
              </p>
              <span className="mt-3 block h-[2px] w-10 bg-[#E0B25A]" />

              <h1 className="mt-6 font-[var(--font-display)] text-[30px] font-light leading-[1.05] text-white sm:text-[40px] md:text-[44px]">
                {copy.titleA}
                <br />
                <span className="font-semibold text-[#F2A65A]">{copy.titleB}</span>
              </h1>

              <p className="mt-5 max-w-[44ch] text-[13px] leading-6 text-white/80 sm:text-[14px] sm:leading-7">
                {copy.desc}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={GLINTS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[12px] font-semibold tracking-[0.12em] text-[#2D4A22] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-white/90"
                >
                  {copy.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <span className="text-[11px] tracking-[0.16em] text-white/55">{copy.via}</span>
              </div>
            </div>
          </div>

          {/* Right: image */}
          <div className="relative hidden min-h-[360px] overflow-hidden rounded-[20px] md:block">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f19d?w=1600&q=80"
              alt="NaturaFoods careers"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#2D4A22]/15" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 sm:pb-20 md:px-8 md:pb-24">
          <div className="grid grid-cols-1 items-center gap-6 rounded-[20px] border border-[#2D4A22]/10 bg-white p-6 shadow-[0_10px_30px_rgba(45,74,34,0.06)] sm:p-8 md:grid-cols-[auto_1fr_auto] md:gap-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EFE0] text-[#2D4A22] sm:h-20 sm:w-20">
              <Briefcase className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-[var(--font-display)] text-[22px] font-semibold text-[#2D4A22] sm:text-[26px]">
                {copy.growTitle}
              </h2>
              <p className="mt-2 max-w-[64ch] text-[13px] leading-6 text-[#1a1a16]/65 sm:text-[14px] sm:leading-7">
                {copy.growDesc}
              </p>
            </div>
            <a
              href={GLINTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2D4A22] px-6 py-3 text-[11px] font-semibold tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(45,74,34,0.18)] transition hover:bg-[#1e3317]"
            >
              {copy.growCta}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="text-[11px] tracking-[0.16em] text-[#2D4A22]/60 underline decoration-[#2D4A22]/20 underline-offset-4 hover:text-[#2D4A22]"
            >
              ← BACK TO HOME
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
