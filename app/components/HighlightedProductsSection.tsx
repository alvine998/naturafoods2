"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { SEED_PRODUCTS } from "../lib/data";
import type { Product } from "../lib/data";
import { apiFetch } from "../lib/api";

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

function typeLabel(t?: Product["type"]): string {
  if (t === "home-brand") return "Home Brand";
  if (t === "small-pack") return "Small Pack";
  return "General";
}

function typeBadgeCls(t?: Product["type"]): string {
  if (t === "home-brand") return "bg-[#2D4A22] text-white border-[#2D4A22]";
  if (t === "small-pack") return "bg-[#EAF2FF] text-[#2D4A22] border-[#2D4A22]/15";
  return "bg-white text-[#8B6F47] border-[#2D4A22]/10";
}

export default function HighlightedProductsSection() {
  const { products } = useStore();
  const [apiList, setApiList] = useState<Product[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try convenience alias first, then filtered query (FRONTEND_API_GUIDE.md:3)
        let data: Product[] | null = null;
        try {
          const j = await apiFetch<Product[]>("/products/highlighted");
          if (j.success && Array.isArray(j.data)) data = j.data as Product[];
        } catch {}
        if (!data) {
          const j2 = await apiFetch<Product[]>("/products?isHighlight=true&limit=8");
          if (j2.success && Array.isArray(j2.data)) data = j2.data as Product[];
        }
        if (!cancelled && data && data.length) {
          // Normalize just in case
          const norm = data.map((p: Record<string, unknown>) => ({
            slug: String(p.slug ?? p.id ?? ""),
            cat: (p.cat as Product["cat"]) ?? "choco",
            title: String(p.title ?? ""),
            note: String(p.note ?? ""),
            tag: String(p.tag ?? ""),
            img: String((p as Record<string, unknown>).img ?? (p as Record<string, unknown>).image ?? ""),
            desc: String(p.desc ?? p.description ?? ""),
            type: (p.type as Product["type"]) ?? "general",
            isHighlight: Boolean(p.isHighlight ?? true),
          })) as Product[];
          setApiList(norm.filter((p) => p.slug));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  const fallback: Product[] = (products?.length ? products : SEED_PRODUCTS).filter((p) => p.isHighlight);
  const list: Product[] = apiList ?? fallback;
  if (list.length === 0) return null;

  return (
    <section id="highlighted" className="bg-[#F5EFE0]/40 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[10px] tracking-[0.2em] text-[#8B6F47] sm:text-[11px] sm:tracking-[0.24em]">FEATURED — HIGHLIGHTED</p>
            <h2 className="mt-2 font-[var(--font-display)] text-[28px] font-light leading-none text-[#2D4A22] sm:text-[36px] md:text-[42px]">
              Highlighted <span className="italic font-normal">products.</span>
            </h2>
            <p className="mt-3 max-w-[48ch] text-[13px] leading-6 text-[#1a1a16]/60">
              Curated selection marked as highlight in the CMS — shown on the home landing page. Use type to organise: Home Brand / Small Pack / General.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/products" className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4">
              View all products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => {
            const isVideo = p.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(p.img ?? "");
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white"
              >
                <Link href={`/products/${p.slug}`} className="block aspect-[4/3] overflow-hidden bg-[#F5EFE0]">
                  {isVideo ? (
                    <video src={p.img} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                  ) : (
                    <motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} src={p.img} alt={p.title} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.08em] ${p.cat === "matcha" ? "bg-[#E8F0E4] border-[#2D4A22]/15 text-[#2D4A22]" : "bg-[#FFF1D6] border-[#8B6F47]/15 text-[#8B6F47]"}`}>{p.cat}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.08em] ${typeBadgeCls(p.type)}`}>{typeLabel(p.type)}</span>
                    <span className="rounded-full bg-[#2D4A22] px-2 py-1 text-[10px] tracking-[0.08em] text-white">★ Highlight</span>
                  </div>
                  <Link href={`/products/${p.slug}`} className="mt-3 flex items-start justify-between gap-3 group/link">
                    <div className="min-w-0">
                      <h3 className="font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] group-hover/link:underline decoration-[#2D4A22]/20 underline-offset-4">{p.title}</h3>
                      <p className="mt-1 text-[12px] text-[#8B6F47]">{p.note}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 py-1 text-[10px] font-medium text-white">{p.tag}</span>
                  </Link>
                  {p.desc && <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#1a1a16]/60">{p.desc}</p>}
                  <Link
                    href={`/products/${p.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#2D4A22]/15 py-2.5 text-[11px] tracking-[0.14em] text-[#2D4A22] transition group-hover:bg-[#2D4A22] group-hover:text-white"
                  >
                    View Detail
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
