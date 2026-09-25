"use client";
import Link from "next/link";
import Image from "../components/SafeImage";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Eye, Compass } from "lucide-react";
import SiteNav from "../components/SiteNav";
import YouTubeEmbed from "../components/YouTubeEmbed";
import SiteFooter from "../components/SiteFooter";
import { useLang } from "../i18n";
import { useCompanySettings } from "../lib/companySettings";

function Reveal({ children, delay = 0, y = 18, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>;
}

export default function AboutPage() {
  const { t } = useLang();
  const L = t.aboutDetail;
  const company = useCompanySettings();
  // Visi/Misi bodies come from Admin → Settings (company_settings singleton);
  // card titles stay per-locale defaults. Edit at /admin/settings.
  const vision = { t: L.values[0]?.t, d: company.visi?.trim() || L.values[0]?.d };
  const mission = { t: L.values[1]?.t, d: company.misi?.trim() || L.values[1]?.d };

  const aboutVideoPoster = L.aboutHeroVideoPoster || "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80";
  const [aboutVideoReady, setAboutVideoReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAboutVideoReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <SiteNav />

      {/* HERO VIDEO */}
      <section aria-label="About" className="w-full">
        <div className="relative min-h-[95vh] overflow-hidden bg-[#1a1a16]">
          <div className="relative h-[95vh] min-h-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
              src={aboutVideoPoster}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${aboutVideoReady ? "opacity-0" : "opacity-100"}`}
              fill
              priority
            />
            <YouTubeEmbed
              src="https://www.youtube.com/embed/FT558Ad3rfY?autoplay=1&mute=1&loop=1&playlist=FT558Ad3rfY&controls=0&modestbranding=1&rel=0&iv_load_policy=3"
              title="About Hero Video"
              wrapperClassName="absolute inset-0"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* PROFILE */}
      {/* <section id="profile" ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          <div className="grid gap-8 py-8 sm:py-10 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-14 lg:py-16">
            <div>
              <Reveal><p className="text-[10px] tracking-[0.22em] text-[#8B6F47] sm:text-[11px]">{L.kicker}</p></Reveal>
              <Reveal delay={0.06}>
                <h2 className="mt-3 font-[var(--font-display)] text-[34px] font-light leading-[0.92] tracking-[-0.02em] text-[#2D4A22] sm:text-[42px] md:text-[52px] lg:text-[60px]">
                  {L.titleA}<br /><span className="font-normal italic">{L.titleB}</span>
                </h2>
              </Reveal>
              <Reveal delay={0.12}><p className="mt-5 max-w-[58ch] text-[14px] leading-7 text-[#1a1a16]/60 sm:text-[15px]">{L.lead}</p></Reveal>
              <Reveal delay={0.18} className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => scrollTo("description")} className="inline-flex items-center gap-1.5 rounded-full bg-[#2D4A22] px-6 py-3 text-[11px] tracking-[0.14em] text-white hover:bg-[#1e3317]">{L.toc[0].toUpperCase()} <ArrowRight className="h-3.5 w-3.5" /></button>
                <Link href="/contact" className="rounded-full border border-[#2D4A22]/15 bg-white px-6 py-3 text-[11px] tracking-[0.14em] text-[#2D4A22] hover:bg-[#FFF7E8]">{L.ctaBtn}</Link>
              </Reveal>
              <Reveal delay={0.22} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {L.stats.map((s) => (
                  <div key={s.k} className="rounded-2xl border border-[#2D4A22]/10 bg-white px-4 py-4">
                    <div className="font-[var(--font-display)] text-[20px] font-medium leading-none text-[#2D4A22]">{s.k}</div>
                    <div className="mt-1 text-[11px] tracking-[0.08em] text-[#8B6F47]">{s.v}</div>
                  </div>
                ))}
              </Reveal>
            </div>
            <motion.div style={{ y: heroY }} className="relative">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[28px] bg-[#F5EFE0] shadow-[0_24px_60px_rgba(45,74,34,0.12)]">
                <motion.div style={{ scale: heroScale }} className="h-full w-full"><Image src={L.heroImage} alt="NaturaFoods" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 backdrop-blur">
                  <div><div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">{L.heroCardKicker}</div><div className="text-[12px] font-medium text-[#2D4A22]">{L.heroCardTitle}</div></div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D4A22] text-white"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 hidden h-28 w-28 rounded-full border border-[#2D4A22]/10 md:block" />
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* DESCRIPTION */}
      <section id="description" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-16">
          <div>
            <p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.storyEyebrow}</p>
            <h2 className="mt-3 font-[var(--font-display)] text-[30px] font-light leading-none tracking-tight text-[#2D4A22] sm:text-[36px] md:text-[44px]">{L.storyTitle}<br /><span className="font-normal italic">{L.storyTitleIt}</span></h2>
            <div className="mt-6 grid gap-4 text-[14px] leading-7 text-[#1a1a16]/70">
              <p>{L.storyP1}</p>
              <p>{L.storyP2}</p>
              <p className="font-medium text-[#2D4A22]">{L.storyP3}</p>
            </div>
            <div className="mt-8 flex gap-5 border-l-2 border-[#2D4A22]/15 pl-5">
              <blockquote className="font-[var(--font-display)] text-[18px] italic leading-7 text-[#2D4A22]">“{L.quote}”<span className="mt-2 block font-sans text-[11px] tracking-[0.12em] text-[#8B6F47]">{L.quoteBy}</span></blockquote>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-[24px] bg-[#FFF7E8]">
              <Image src={L.storyImage} alt="Baking" className="aspect-[4/3] w-full object-cover" width={600} height={450} />
              <div className="p-5">
                <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">{L.storyCardLabel}</div>
                <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/70">{L.storyCardDesc}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] bg-[#2D4A22] p-5 text-white">
                <div className="text-[11px] tracking-[0.14em] text-white/60">{L.promiseLabel}</div>
                <div className="mt-2 font-[var(--font-display)] text-[15px] leading-6">{L.promiseDesc}</div>
              </div>
              <div className="rounded-[20px] border border-[#2D4A22]/10 bg-white p-5">
                <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">{L.b2bLabel}</div>
                <div className="mt-2 text-[13px] leading-6 text-[#1a1a16]/70">{L.b2bDesc}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section id="vision" className="bg-[#F5EFE0]/40">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.valuesEyebrow}</p>
            <h2 className="mt-3 font-[var(--font-display)] text-[30px] font-light text-[#2D4A22] sm:text-[36px] md:text-[42px]">{L.valuesTitle}</h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
            {/* Vision Card */}
            <Reveal delay={0.05}>
              <div className="group relative overflow-hidden rounded-[28px] bg-[#2D4A22] p-7 sm:p-9 md:min-h-[340px]">
                {/* Decorative large number */}
                <div className="pointer-events-none absolute -right-4 -top-6 font-[var(--font-display)] text-[160px] font-light leading-none text-white/[0.04] select-none md:-right-2 md:text-[200px]">
                  01
                </div>
                <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-[var(--font-display)] text-[18px] font-normal tracking-[-0.01em] text-white sm:text-[20px]">
                    {vision?.t}
                  </h3>
                  <p className="mt-3 max-w-[42ch] text-[13px] leading-[1.7] text-white/65 sm:text-[14px]">
                    {vision?.d}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Mission Card */}
            <Reveal delay={0.12}>
              <div className="group relative overflow-hidden rounded-[28px] border border-[#2D4A22]/[0.08] bg-white p-7 shadow-[0_8px_40px_rgba(45,74,34,0.06)] sm:p-9 md:min-h-[340px]">
                {/* Decorative large number */}
                <div className="pointer-events-none absolute -right-4 -top-6 font-[var(--font-display)] text-[160px] font-light leading-none text-[#2D4A22]/[0.04] select-none md:-right-2 md:text-[200px]">
                  02
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#2D4A22]/[0.02] blur-3xl" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2D4A22]/10 bg-[#F5EFE0] text-[#2D4A22]">
                    <Compass className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-[var(--font-display)] text-[18px] font-normal tracking-[-0.01em] text-[#2D4A22] sm:text-[20px]">
                    {mission?.t}
                  </h3>
                  <p className="mt-3 max-w-[42ch] text-[13px] leading-[1.7] text-[#1a1a16]/55 sm:text-[14px]">
                    {mission?.d}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
