"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import { useLang } from "../i18n";

function Reveal({ children, delay = 0, y = 18, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>;
}

export default function AboutPage() {
  const { t } = useLang();
  const L = t.aboutDetail;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteNav />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          <div className="grid gap-8 py-8 sm:py-10 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-14 lg:py-16">
            <div>
              <Reveal><p className="text-[10px] tracking-[0.22em] sm:text-[11px] text-[#8B6F47]">{L.kicker}</p></Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-3 font-[var(--font-display)] text-[34px] sm:text-[42px] font-light leading-[0.92] tracking-[-0.02em] text-[#2D4A22] md:text-[52px] lg:text-[60px]">
                  {L.titleA}<br /><span className="font-normal italic">{L.titleB}</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}><p className="mt-5 max-w-[58ch] text-[14px] leading-7 text-[#1a1a16]/60 sm:text-[15px]">{L.lead}</p></Reveal>
              <Reveal delay={0.18} className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => scrollTo("story")} className="inline-flex items-center gap-1.5 rounded-full bg-[#2D4A22] px-6 py-3 text-[11px] tracking-[0.14em] text-white hover:bg-[#1e3317]">{L.toc[0].toUpperCase()} <ArrowRight className="h-3.5 w-3.5" /></button>
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
                <motion.img style={{ scale: heroScale }} src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80" alt="NaturaFoods" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 backdrop-blur">
                  <div><div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">PT NATURA INTI SUKSES</div><div className="text-[12px] font-medium text-[#2D4A22]">Baking Ingredients · Principals Trusted</div></div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D4A22] text-white"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 hidden h-28 w-28 rounded-full border border-[#2D4A22]/10 md:block" />
            </motion.div>
          </div>
        </div>

        {/* sticky TOC */}
        <div className="sticky top-[64px] z-20 border-y border-[#2D4A22]/10 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1280px] items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 text-[10px] tracking-[0.18em] text-[#8B6F47] sm:block">JUMP TO</span>
            {L.toc.map((label, i) => {
              const ids = ["story", "journey", "chain", "values", "origins", "warehouse"];
              return (
                <button key={label} onClick={() => scrollTo(ids[i])} className="shrink-0 rounded-full border border-[#2D4A22]/10 bg-white px-4 py-2 text-[11px] tracking-[0.1em] text-[#2D4A22] hover:bg-[#2D4A22] hover:text-white hover:border-[#2D4A22] transition">
                  {label}
                </button>
              );
            })}
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              {t.aboutBadges.map((b) => (
                <span key={b} className="rounded-full bg-[#2D4A22] px-3 py-1 text-[10px] tracking-[0.12em] text-white">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-[#2D4A22]/10 bg-white py-3">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="flex w-max gap-8 whitespace-nowrap text-[11px] tracking-[0.2em] text-[#2D4A22]/60">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8">{t.marquee.map((s) => <span key={s} className="flex items-center gap-8">{s} <span className="h-1 w-1 rounded-full bg-[#C4B5A0]" /></span>)} </span>
          ))}
        </motion.div>
      </div>

      {/* STORY */}
      <section id="story" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:items-start">
          <div>
            <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.storyEyebrow}</p></Reveal>
            <Reveal delay={0.06}><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none tracking-tight text-[#2D4A22] md:text-[44px]">{L.storyTitle}<br /><span className="italic font-normal">{L.storyTitleIt}</span></h2></Reveal>
            <Reveal delay={0.12} className="mt-6 grid gap-4 text-[14px] leading-7 text-[#1a1a16]/70">
              <p>{L.storyP1}</p>
              <p>{L.storyP2}</p>
              <p className="font-medium text-[#2D4A22]">{L.storyP3}</p>
            </Reveal>
            <Reveal delay={0.18} className="mt-8 flex gap-5 border-l-2 border-[#2D4A22]/15 pl-5">
              <blockquote className="font-[var(--font-display)] text-[18px] italic leading-7 text-[#2D4A22]">“{L.quote}”<span className="mt-2 block font-sans text-[11px] not-italic tracking-[0.12em] text-[#8B6F47]">{L.quoteBy}</span></blockquote>
            </Reveal>
          </div>
          <div className="grid gap-4">
            <Reveal y={24} className="overflow-hidden rounded-[24px] bg-[#FFF7E8]">
              <img src="https://images.unsplash.com/photo-1511381939415-e44015466834?w=900&q=80" alt="Baking" className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">WHAT WE HOLD</div>
                <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/70">Baking ingredients & F&B additives — selected quality from trusted principals, for nationwide distribution.</div>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] bg-[#2D4A22] p-5 text-white">
                <div className="text-[11px] tracking-[0.14em] text-white/60">PROMISE</div>
                <div className="mt-2 font-[var(--font-display)] text-[15px] leading-6">Selected quality. Marketing network + qualified HR that builds market with principals.</div>
              </div>
              <div className="rounded-[20px] border border-[#2D4A22]/10 bg-white p-5">
                <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">FOR B2B</div>
                <div className="mt-2 text-[13px] leading-6 text-[#1a1a16]/70">Bakery · Food Mfg · HORECA · Retail — food & beverage ingredients Indonesia-wide.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <section id="journey" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.journeyEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none text-[#2D4A22] md:text-[44px]">{L.journeyTitle} <span className="italic font-normal">{L.journeyTitleIt}</span></h2></Reveal>
          <div className="relative mt-10 grid gap-0 md:grid-cols-[1fr_1fr] md:gap-8">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#2D4A22]/10" />
            {L.timeline.map((s, i) => (
              <Reveal key={s.y} delay={i * 0.06} className={`relative flex gap-4 py-6 md:py-8 ${i % 2 === 0 ? "md:pr-10 md:text-right md:flex-row-reverse" : "md:col-start-2 md:pl-10"}`}>
                <div className="hidden md:block absolute top-8 h-3 w-3 rounded-full border-2 border-[#2D4A22] bg-white shadow-sm" style={{ [i % 2 === 0 ? "right" : "left"]: "-6px" } as never} />
                <div className="shrink-0">
                  <span className="inline-flex rounded-full bg-[#2D4A22] px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white">{s.y}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#2D4A22]">{s.t}</div>
                  <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/60">{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPLY CHAIN */}
      <section id="chain" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.chainEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none text-[#2D4A22] md:text-[44px]">{L.chainTitle}<br /><span className="italic font-normal">{L.chainTitleIt}</span></h2></Reveal>
          <Reveal delay={0.08} className="max-w-[38ch] text-[13px] leading-6 text-[#1a1a16]/60">Principals → Natura Inti → your pantry. Strong relationships, nationwide reach, qualified support.</Reveal>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {L.steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07} className="rounded-[20px] border border-[#2D4A22]/10 bg-white p-6">
              <div className="text-[11px] tracking-[0.2em] text-[#C4B5A0]">{s.n}</div>
              <h3 className="mt-3 font-[var(--font-display)] text-[17px] font-medium text-[#2D4A22]">{s.t}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{s.d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-6 overflow-hidden rounded-[24px] border border-[#2D4A22]/10 bg-[#FFF7E8] md:flex">
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80" alt="Cafe" className="h-56 w-full object-cover md:h-auto md:w-[46%]" />
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">WHY IT MATTERS</div>
            <div className="mt-2 font-[var(--font-display)] text-[20px] leading-tight text-[#2D4A22]">Strong principals + strong network = major share, sustainably.</div>
            <p className="mt-3 text-[13px] leading-6 text-[#1a1a16]/60">Opportunity & challenge we embrace: achieve huge markets together, then continue & develop more in the next future — quality first.</p>
            <Link href="/products" className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.14em] text-white">VIEW PRODUCTS <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </Reveal>
      </section>

      {/* VALUES */}
      <section id="values" className="bg-[#F5EFE0]/60">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.valuesEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light text-[#2D4A22] md:text-[42px]">Visi & Misi — quality, network, people.</h2></Reveal>
          <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
            {L.values.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08} className="rounded-[24px] bg-white p-6 sm:p-7 border border-[#2D4A22]/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#2D4A22]/10 text-[#2D4A22]"><Check className="h-4 w-4" /></div>
                <h3 className="mt-4 font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">{v.t}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ORIGINS */}
      <section id="origins" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.originsEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light text-[#2D4A22] md:text-[42px]">Categories we carry.</h2></Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {L.origins.map((o, i) => (
            <Reveal key={o.name} delay={i * 0.08} className="group overflow-hidden rounded-[24px] border border-[#2D4A22]/10 bg-white">
              <div className="aspect-[16/10] overflow-hidden bg-[#F5EFE0]"><img src={o.img} alt={o.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /></div>
              <div className="p-6">
                <div className="text-[11px] tracking-[0.16em] text-[#8B6F47]">{o.place}</div>
                <div className="mt-1 font-[var(--font-display)] text-[20px] font-medium text-[#2D4A22]">{o.name}</div>
                <div className="mt-1 text-[13px] leading-6 text-[#1a1a16]/60">{o.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WAREHOUSE */}
      <section id="warehouse" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <Reveal className="overflow-hidden rounded-[24px] bg-[#FFF7E8] border border-[#2D4A22]/10">
              <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80" alt="Warehouse" className="aspect-[4/3] w-full object-cover" />
              <div className="grid grid-cols-3 divide-x divide-[#2D4A22]/10 border-t border-[#2D4A22]/10 bg-white text-center">
                <div className="p-4"><div className="font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">2010–16</div><div className="text-[10px] tracking-[0.1em] text-[#8B6F47]">EXPERIENCE</div></div>
                <div className="p-4"><div className="font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">B2B</div><div className="text-[10px] tracking-[0.1em] text-[#8B6F47]">NETWORK</div></div>
                <div className="p-4"><div className="font-[var(--font-display)] text-[16px] font-medium text-[#2D4A22]">Nationwide</div><div className="text-[10px] tracking-[0.1em] text-[#8B6F47]">REACH</div></div>
              </div>
            </Reveal>
            <div>
              <Reveal><p className="text-[11px] tracking-[0.24em] text-[#8B6F47]">{L.whEyebrow}</p><h2 className="mt-3 font-[var(--font-display)] text-[30px] sm:text-[36px] font-light leading-none text-[#2D4A22] md:text-[44px]">{L.whTitle}<br /><span className="italic font-normal">{L.whTitleIt}</span></h2></Reveal>
              <Reveal delay={0.08} className="mt-6 grid gap-3">
                {L.whBullets.map((b) => (
                  <div key={b} className="flex gap-3 rounded-2xl border border-[#2D4A22]/10 bg-white px-4 py-3 text-[13px] leading-6 text-[#1a1a16]/70"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D4A22]" />{b}</div>
                ))}
              </Reveal>
              <Reveal delay={0.14} className="mt-6 flex flex-wrap gap-2">
                {t.aboutBadges.map((b) => <span key={b} className="rounded-full border border-[#2D4A22]/10 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22]">{b}</span>)}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2D4A22] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1280px] grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <Reveal><p className="text-[11px] tracking-[0.2em] text-white/60">LET&apos;S WORK TOGETHER</p><h2 className="mt-3 font-[var(--font-display)] text-[28px] sm:text-[34px] font-light leading-none text-white md:text-[42px]">{L.ctaTitle}</h2><p className="mt-4 max-w-[52ch] text-[13px] leading-6 text-white/65">{L.ctaDesc}</p></Reveal>
          </div>
          <Reveal delay={0.1} className="rounded-[24px] bg-white p-6 sm:p-8">
            <div className="text-[11px] tracking-[0.14em] text-[#8B6F47]">PARTNER INQUIRY</div>
            <div className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">Response within 24h · samples & barista kit available. Net-14 & consignment for volume.</div>
            <Link href="/contact" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#2D4A22] py-3.5 text-[11px] tracking-[0.14em] text-white hover:bg-[#1e3317]">{L.ctaBtn} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-[12px]"><a href="mailto:hello@naturafoods.id" className="underline decoration-[#2D4A22]/20 underline-offset-4 text-[#2D4A22]">hello@naturafoods.id</a><a href="https://wa.me/6281234567890" className="underline decoration-[#2D4A22]/20 underline-offset-4 text-[#2D4A22]">WhatsApp</a></div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
