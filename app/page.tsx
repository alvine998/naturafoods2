"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import LenisProvider from "./components/LenisProvider";
import Splash from "./components/Splash";
import HeroSlider from "./components/HeroSlider";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import { useLang } from "./i18n";

function Reveal({ children, delay = 0, y = 24, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>;
}
function Parallax({ children, offset = 80, className = "" }: { children: React.ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  return <div ref={ref} className={className} style={{ overflow: "clip" }}><motion.div style={{ y }}>{children}</motion.div></div>;
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const { t } = useLang();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).__lenis;
    if (lenis && el) lenis.scrollTo(el, { offset: -72 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <LenisProvider enabled={entered} />
      <Splash onDone={() => setEntered(true)} sub={t.splashSub} foot={t.splashFoot} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: entered ? 1 : 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="bg-[#FFFCF2] overflow-x-hidden">
        <SiteNav />
        <HeroSlider onCta={scrollTo} slides={t.heroSlides} />

        <section ref={heroRef} className="relative overflow-hidden">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-[1.08fr_0.92fr] md:px-8 md:py-16 lg:py-20">
            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col justify-center">
              <Reveal><p className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-[#2D4A22]/10 bg-white px-3 py-1 text-[10px] tracking-[0.2em] text-[#8B6F47]"><span className="h-1.5 w-1.5 rounded-full bg-[#2D4A22] animate-pulse" />{t.heroBadge}</p></Reveal>
              <Reveal delay={0.08}>
                <h1 className="font-[var(--font-display)] text-[30px] xs:text-[34px] sm:text-[42px] font-light leading-[0.95] tracking-[-0.02em] text-[#2D4A22] md:text-[52px] lg:text-[62px] xl:text-[70px]">
                  {t.heroTitle1}<br /><span className="font-normal italic">{t.heroTitleItalic}</span> {t.heroTitleAfterItalic}<br />{t.heroTitleLine3}<br />{t.heroTitleLine4}
                </h1>
              </Reveal>
              <Reveal delay={0.16}><p className="mt-4 sm:mt-6 max-w-[46ch] text-[14px] sm:text-[15px] leading-6 sm:leading-7 text-[#1a1a16]/60">{t.heroDesc}</p></Reveal>
              <Reveal delay={0.22} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link href="/products" className="group inline-flex items-center gap-2 sm:gap-3 rounded-full bg-[#2D4A22] px-5 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-[12px] tracking-[0.16em] text-white transition hover:bg-[#1e3317]">{t.viewCatalog}<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white group-hover:text-[#2D4A22]"><ArrowRight className="h-3.5 w-3.5" /></span></Link>
                <Link href="/about" className="text-[11px] tracking-[0.16em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-8 hover:decoration-[#2D4A22]">{t.companyProfile}</Link>
              </Reveal>
              <Reveal delay={0.28} className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-[#2D4A22]/10 pt-6 sm:pt-8">
                {[[t.stat1k, t.stat1v], [t.stat2k, t.stat2v], [t.stat3k, t.stat3v]].map(([k, v]) => (
                  <div key={k}><div className="font-[var(--font-display)] text-[18px] sm:text-[22px] font-medium leading-none text-[#2D4A22]">{k}</div><div className="mt-1 text-[10px] sm:text-[11px] tracking-[0.12em] text-[#8B6F47]">{v}</div></div>
                ))}
              </Reveal>
            </motion.div>
            <div className="relative grid grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-4">
              <div className="relative aspect-[4/5.4] overflow-hidden rounded-[20px] sm:rounded-[28px] bg-[#F5EFE0]">
                <motion.img style={{ scale: heroScale }} src="https://images.unsplash.com/photo-1610611424854-5e07032143d8?w=900&q=80" alt="Chocolate" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <span className="absolute left-3 sm:left-4 top-3 sm:top-4 rounded-full bg-white/90 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.16em] text-[#2D4A22] backdrop-blur">{t.cardChocoLabel}</span>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative flex-1 overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#E8F0E2]">
                  <img src="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=700&q=80" alt="Matcha" className="h-full w-full object-cover" />
                  <span className="absolute left-2 sm:left-3 top-2 sm:top-3 rounded-full bg-white/90 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.16em] text-[#2D4A22] backdrop-blur">{t.cardMatchaLabel}</span>
                </div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={entered ? { y: 0, opacity: 1 } : {}} transition={{ delay: 1.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="rounded-2xl bg-white p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
                  <div className="text-[10px] sm:text-[11px] tracking-[0.14em] text-[#8B6F47]">{t.cardPriceEyebrow}</div>
                  <div className="mt-1 flex items-baseline gap-2"><span className="font-[var(--font-display)] text-[16px] sm:text-[20px] font-medium text-[#2D4A22]">{t.cardPriceTitle}</span></div>
                  <div className="text-[10px] sm:text-[11px] text-[#8B6F47]">{t.cardPriceSub}</div>
                  <Link href="/contact" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#2D4A22] py-2 text-[11px] tracking-[0.14em] text-white">{t.cardRequestPrice} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </motion.div>
              </div>
              <Parallax offset={40} className="pointer-events-none absolute -right-4 -top-4 hidden md:block"><div className="h-24 w-24 rounded-full border border-[#2D4A22]/10" /></Parallax>
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-y border-[#2D4A22]/10 bg-white py-3">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} className="flex w-max items-center gap-6 sm:gap-8 whitespace-nowrap text-[10px] sm:text-[11px] tracking-[0.22em] text-[#2D4A22]/60">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex items-center gap-6 sm:gap-8">{t.marquee.map((s, idx) => <span key={s} className="flex items-center gap-6 sm:gap-8"><span>{s}</span>{idx < t.marquee.length - 1 && <span className="h-1 w-1 rounded-full bg-[#C4B5A0]" />}</span>)}<span className="h-1 w-1 rounded-full bg-[#C4B5A0]" /></span>
            ))}
          </motion.div>
        </div>

        <section id="about" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-16">
            <Parallax offset={60} className="order-2 md:order-1"><div className="relative aspect-[4/3.1] overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#FFF7E8]"><img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80" alt="Warehouse" className="h-full w-full object-cover" /></div></Parallax>
            <div className="order-1 md:order-2">
              <Reveal><p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{t.aboutEyebrow}</p></Reveal>
              <Reveal delay={0.08}><h2 className="mt-2 sm:mt-3 font-[var(--font-display)] text-[28px] sm:text-[34px] font-light leading-none tracking-tight text-[#2D4A22] md:text-[44px]">{t.aboutTitle1}<br /><span className="italic font-normal">{t.aboutTitle2}</span></h2></Reveal>
              <Reveal delay={0.14}><p className="mt-4 sm:mt-5 max-w-[46ch] text-[14px] sm:text-[15px] leading-6 sm:leading-7 text-[#1a1a16]/65">{t.aboutDesc}</p><ul className="mt-4 sm:mt-5 grid gap-2 text-[13px] leading-6 text-[#1a1a16]/70">{t.aboutBullets.map((b) => <li key={b} className="flex gap-2"><Minus className="mt-1 h-3 w-3 shrink-0 text-[#2D4A22]" />{b}</li>)}</ul></Reveal>
              <Reveal delay={0.2} className="mt-6 sm:mt-8 flex gap-4 sm:gap-6"><div className="hidden sm:block h-16 w-px shrink-0 bg-[#2D4A22]/15" /><blockquote className="max-w-[34ch] font-[var(--font-display)] text-[15px] sm:text-[17px] italic leading-6 sm:leading-7 text-[#2D4A22]">&ldquo;{t.aboutQuote}&rdquo;<span className="mt-2 block font-sans text-[11px] not-italic tracking-[0.14em] text-[#8B6F47]">{t.aboutQuoteAttr}</span></blockquote></Reveal>
              <Reveal delay={0.26} className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">{t.aboutBadges.map((b) => <span key={b} className="rounded-full border border-[#2D4A22]/10 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] tracking-[0.12em] text-[#2D4A22]">{b}</span>)}</Reveal>
              <Reveal delay={0.3} className="mt-4 sm:mt-6"><Link href="/about" className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4">View more <ArrowRight className="h-3 w-3" /></Link></Reveal>
            </div>
          </div>
        </section>

        <section id="choco" className="bg-white">
          <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6"><Reveal><p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{t.chocoEyebrow}</p><h2 className="mt-2 sm:mt-3 font-[var(--font-display)] text-[26px] sm:text-[34px] font-light leading-none text-[#2D4A22] md:text-[42px]">{t.chocoTitle1} <span className="italic font-normal">{t.chocoTitle2}</span></h2></Reveal><Reveal delay={0.1} className="text-[13px] leading-6 text-[#1a1a16]/60 sm:max-w-[40ch]">{t.chocoDesc}</Reveal></div>
            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">{t.chocoProducts.map((p, i) => {
              const slugs = ["belgian-dark-72", "milk-couverture-33", "white-chocolate-28"];
              return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} whileHover={{ y: -6, transition: { duration: 0.22 } }} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-[#FFFCF2]">
                <Link href={`/products/${slugs[i]}`} className="block aspect-[4/3] overflow-hidden bg-[#F5EFE0]"><motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} src={p.img} alt={p.title} className="h-full w-full object-cover" /></Link>
                <div className="p-4 sm:p-5"><Link href={`/products/${slugs[i]}`} className="flex items-start justify-between gap-3 group/link"><div className="min-w-0"><h3 className="font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] group-hover/link:underline decoration-[#2D4A22]/20 underline-offset-4">{p.title}</h3><p className="mt-1 text-[12px] text-[#8B6F47]">{p.note}</p></div><span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-medium text-white">{p.tag}</span></Link><Link href={`/products/${slugs[i]}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#2D4A22]/15 py-2.5 text-[11px] tracking-[0.14em] text-[#2D4A22] transition group-hover:bg-[#2D4A22] group-hover:text-white">View Detail</Link></div>
              </motion.div>);})}
            </div>
            <div className="mt-6 text-center"><Link href="/products?cat=choco" className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline">View all products <ArrowRight className="h-3 w-3" /></Link></div>
          </div>
        </section>

        <section id="matcha" className="bg-[#F5EFE0]/60">
          <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6"><Reveal><p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{t.matchaEyebrow}</p><h2 className="mt-2 sm:mt-3 font-[var(--font-display)] text-[26px] sm:text-[34px] font-light leading-none text-[#2D4A22] md:text-[42px]">{t.matchaTitle1} <span className="italic font-normal">{t.matchaTitle2}</span></h2></Reveal><Reveal delay={0.1} className="text-[13px] leading-6 text-[#1a1a16]/60 sm:max-w-[42ch]">{t.matchaDesc}</Reveal></div>
            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">{t.matchaProducts.map((p, i) => {
              const slugs = ["uji-ceremonial-yame", "culinary-matcha-nishio", "hojicha-roasted"];
              return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} whileHover={{ y: -6, transition: { duration: 0.22 } }} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white">
                <Link href={`/products/${slugs[i]}`} className="block aspect-[4/3] overflow-hidden bg-[#E8F0E2]"><motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} src={p.img} alt={p.title} className="h-full w-full object-cover" /></Link>
                <div className="p-4 sm:p-5"><Link href={`/products/${slugs[i]}`} className="flex items-start justify-between gap-3 group/link"><div className="min-w-0"><h3 className="font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] group-hover/link:underline decoration-[#2D4A22]/20 underline-offset-4">{p.title}</h3><p className="mt-1 text-[12px] text-[#8B6F47]">{p.note}</p></div><span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-medium text-white">{p.tag}</span></Link><Link href={`/products/${slugs[i]}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#2D4A22]/15 py-2.5 text-[11px] tracking-[0.14em] text-[#2D4A22] transition group-hover:bg-[#2D4A22] group-hover:text-white">View Detail</Link></div>
              </motion.div>);})}
            </div>
          </div>
        </section>

        <section className="relative h-[52vh] min-h-[340px] sm:h-[56vh] sm:min-h-[380px] overflow-hidden">
          <Parallax offset={110} className="absolute inset-0"><img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80" alt="Café" className="h-[140%] w-full object-cover" /></Parallax>
          <div className="absolute inset-0 bg-[#1a1a16]/45" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
            <Reveal><p className="text-[10px] sm:text-[11px] tracking-[0.28em] text-white/80">{t.bannerEyebrow}</p></Reveal>
            <Reveal delay={0.08}><h2 className="mt-3 sm:mt-4 max-w-[18ch] font-[var(--font-display)] text-[28px] sm:text-[34px] font-light leading-[0.9] text-white md:text-[52px]">{t.bannerTitle1} <span className="italic">{t.bannerTitleItalic}</span> {t.bannerTitle3}</h2></Reveal>
            <Reveal delay={0.16}><p className="mt-3 sm:mt-4 max-w-[52ch] text-[13px] sm:text-[14px] leading-6 text-white/80">{t.bannerDesc}</p></Reveal>
          </div>
        </section>

        <section id="partners" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
          <Reveal><p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{t.partnersEyebrow}</p><h2 className="mt-2 sm:mt-3 font-[var(--font-display)] text-[26px] sm:text-[34px] font-light leading-none text-[#2D4A22] md:text-[42px]">{t.partnersTitle1} <span className="italic font-normal">{t.partnersTitle2}</span></h2></Reveal>
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">{t.partnersCards.map((c, i) => (<Reveal key={c.n} delay={i * 0.08} className="rounded-2xl border border-[#2D4A22]/10 bg-white p-5 sm:p-6"><div className="text-[11px] tracking-[0.2em] text-[#C4B5A0]">{c.n}</div><h3 className="mt-2 font-[var(--font-display)] text-[17px] sm:text-[19px] font-medium text-[#2D4A22]">{c.t}</h3><p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60">{c.d}</p></Reveal>))}</div>
          <Reveal delay={0.2} className="mt-8 sm:mt-10 flex flex-col gap-3 border-t border-[#2D4A22]/10 pt-6 sm:pt-8 sm:flex-row sm:flex-wrap sm:items-center"><span className="text-[11px] tracking-[0.16em] text-[#8B6F47]">{t.trustedBy}</span><div className="flex flex-wrap gap-2">{["% Arabica", "Common Grounds", "Tanamera", "Anomali", "Giyanti", "One Fifteenth"].map((b) => (<span key={b} className="rounded-full bg-white border border-[#2D4A22]/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.1em] text-[#2D4A22]/70">{b}</span>))}<span className="px-2 sm:px-3 py-1.5 text-[11px] text-[#8B6F47]">{t.morePartners}</span></div></Reveal>
        </section>

        <section id="contact" className="bg-[#2D4A22] px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-[1280px] gap-8 sm:gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div><h3 className="font-[var(--font-display)] text-[26px] sm:text-[30px] font-light leading-none text-white md:text-[36px]">{t.contactTitle}</h3><p className="mt-3 max-w-[48ch] text-[13px] leading-6 text-white/65">{t.contactDesc}</p><div className="mt-6"><Link href="/contact" className="inline-flex items-center gap-1 rounded-full bg-white px-6 py-2.5 text-[11px] tracking-[0.14em] text-[#2D4A22]">Go to contact page <ArrowRight className="h-3 w-3" /></Link></div></div>
            <div className="rounded-[20px] bg-white p-5 sm:p-6 md:p-7 text-center">
              <p className="text-[13px] leading-6 text-[#1a1a16]/60">Full inquiry form moved to</p>
              <Link href="/contact" className="mt-3 inline-flex rounded-full bg-[#2D4A22] px-6 py-3 text-[11px] tracking-[0.14em] text-white">CONTACT US</Link>
              <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6 text-[12px]"><a href="mailto:hello@naturafoods.id" className="underline text-[#2D4A22] break-all">hello@naturafoods.id</a><a href="https://wa.me/6281234567890" className="underline text-[#2D4A22]">WhatsApp</a></div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </motion.div>
    </>
  );
}
