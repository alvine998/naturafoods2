"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "../i18n";
import { useStore } from "../lib/store";
import type { Article } from "../lib/data";
import EduInnoSliderBanner from "./EduInnoSliderBanner";

function sortByDateDesc(list: Article[]): Article[] {
  return [...list].sort((x, y) => {
    const tx = Date.parse(x.date ?? "");
    const ty = Date.parse(y.date ?? "");
    const vx = Number.isFinite(tx) ? tx : 0;
    const vy = Number.isFinite(ty) ? ty : 0;
    return vy - vx;
  });
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LatestStoriesSection() {
  const { t } = useLang();
  const { articles, edu, innovation, ready } = useStore();

  const list: Article[] = sortByDateDesc(
    (articles ?? []).filter((a): a is Article => a !== null && Boolean(a.slug) && Boolean(a.title))
  ).slice(0, 3);

  // NOTE: the education/innovation banner lives in this section, so it must
  // not be gated on articles. Only skip the whole section once loading is
  // done AND every source is confirmed empty.
  const hasEduInno = (edu ?? []).length > 0 || (innovation ?? []).length > 0;
  if (ready && !hasEduInno && list.length === 0) return null;

  return (
    <section id="latest-stories" className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <Reveal>
          <EduInnoSliderBanner />
        </Reveal>

        {list.length > 0 && (
        <>
        <div className="mt-10 sm:mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[10px] tracking-[0.2em] text-[#8B6F47] sm:text-[11px] sm:tracking-[0.24em]">
              {t.articlesPage.eyebrow}
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-[28px] font-light leading-none text-[#2D4A22] sm:text-[36px] md:text-[42px]">
              Latest <span className="italic font-normal">story.</span>
            </h2>
            <p className="mt-3 max-w-[48ch] text-[13px] leading-6 text-[#1a1a16]/60">{t.articlesPage.desc}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4"
            >
              {t.homeCommon.viewMore} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a, i) => {
            const src = a.img?.trim() ? a.img : null;
            const isVideo =
              !!src && (src.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(src));
            return (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white"
              >
                <Link href={`/articles/${a.slug}`} className="block aspect-[16/10] overflow-hidden bg-[#F5EFE0]">
                  {src ? (
                    isVideo ? (
                      <video src={src} muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <Image
                        src={src}
                        alt={a.title}
                        width={640}
                        height={400}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                      />
                    )
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[#F5EFE0] text-[11px] tracking-[0.14em] text-[#8B6F47]">
                      No image
                    </div>
                  )}
                </Link>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-[#8B6F47]">
                    <span className="rounded-full border border-[#2D4A22]/10 bg-white px-2.5 py-1">{a.category}</span>
                    <span>{a.date}</span>
                  </div>
                  <Link href={`/articles/${a.slug}`} className="group/link">
                    <h3 className="mt-3 font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] break-words group-hover/link:underline decoration-[#2D4A22]/20 underline-offset-4">
                      {a.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60 line-clamp-2">{a.excerpt}</p>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4"
                  >
                    {t.articlesPage.readMore} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        </>
        )}
      </div>
    </section>
  );
}
