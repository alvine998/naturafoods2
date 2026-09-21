"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../lib/store";
import type { Product, ProductCategory } from "../lib/data";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

const MAX_PRODUCTS = 4;

export default function HighlightedProductsSection() {
  const { products, productCategories } = useStore();

  const sections = useMemo(() => {
    const highlighted = productCategories.filter((c) => c.isHighlight && c.isActive);
    return highlighted.map((cat) => ({
      category: cat,
      products: products.filter((p) => p.cat === cat.slug).slice(0, MAX_PRODUCTS),
    })).filter((s) => s.products.length > 0);
  }, [products, productCategories]);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section, sIdx) => {
        const cat = section.category;
        const bg = sIdx % 2 === 0 ? "bg-white" : "bg-[#F5EFE0]/60";
        return (
          <section key={cat.id} id={cat.slug} className={bg}>
            <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
                <Reveal>
                  <p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{cat.name.toUpperCase()}</p>
                  <h2 className="mt-2 sm:mt-3 font-[var(--font-display)] text-[26px] sm:text-[34px] font-light leading-none text-[#2D4A22] md:text-[42px]">
                    {cat.description || cat.name} <span className="italic font-normal">series.</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <Link href={`/products?cat=${cat.slug}`} className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4">
                    {`View all ${cat.name}`} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Reveal>
              </div>
              <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {section.products.map((p, i) => (
                  <motion.div key={p.slug} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} whileHover={{ y: -6, transition: { duration: 0.22 } }} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white">
                    <Link href={`/products/${p.slug}`} className="block aspect-[4/3] overflow-hidden bg-[#F5EFE0]">
                      {p.img?.trim() ? (
                        <Image src={p.img} alt={p.title} width={400} height={300} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[11px] tracking-[0.14em] text-[#8B6F47]">No image</div>
                      )}
                    </Link>
                    <div className="p-4 sm:p-5">
                      <Link href={`/products/${p.slug}`} className="flex items-start justify-between gap-3 group/link">
                        <div className="min-w-0">
                          <h3 className="font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] group-hover/link:underline decoration-[#2D4A22]/20 underline-offset-4">{p.title}</h3>
                          <p className="mt-1 text-[12px] text-[#8B6F47]">{p.note}</p>
                        </div>
                        {p.tag && <span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-medium text-white">{p.tag}</span>}
                      </Link>
                      <Link href={`/products/${p.slug}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#2D4A22]/15 py-2.5 text-[11px] tracking-[0.14em] text-[#2D4A22] transition group-hover:bg-[#2D4A22] group-hover:text-white">View Detail</Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
