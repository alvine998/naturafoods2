"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import Image from "./SafeImage";
import ContactInfoSection from "./ContactInfoSection";
import { sortByLandingOrder, sortOfficialPartners, useStore } from "../lib/store";
import { useLang } from "../i18n";
import { SEED_OFFICIAL_PARTNERS } from "../lib/data";
import type { OfficialPartner } from "../lib/data";

type PartnerBrand = { id: string; name: string; logo: string };

type PartnerCard = {
  title: string;
  description: string;
  image: string;
  brandLogo: string;
  brandName: string;
  link: string;
  color: string;
  background?: string;
  images?: string[];
  brandIds?: string[];
  brands?: PartnerBrand[];
  sortIndex: number;
};

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

const partnerCards: PartnerCard[] = [
  {
    title: "Cocoa Powder",
    description:
      "Cocoa powder berkualitas tinggi untuk cita rasa cokelat yang kaya dan autentik.",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80",
    brandLogo: "",
    brandName: "Bens Dorp",
    link: "/products?cat=cocoa-powder-series",
    color: "#5D4037",
    sortIndex: 1,
  },
  {
    title: "Japanese Tea Series",
    description:
      "Bubuk teh hijau premium dengan warna cerah dan rasa khas jepang.",
    image:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80",
    brandLogo: "",
    brandName: "Afya",
    link: "/products?cat=japanese-tea-series",
    color: "#2E7D32",
    sortIndex: 2,
  },
  {
    title: "Specialty Filling",
    description:
      "Filling premium untuk berbagai kreasi roti, kue, dan pastry dengan tekstur lembut dan rasa istimewa.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    brandLogo: "",
    brandName: "Trang Nghi",
    link: "/products?cat=specialty-filling",
    color: "#1565C0",
    sortIndex: 3,
  },
  {
    title: "Nuts",
    description:
      "Kacang pilihan dengan kualitas terbaik untuk kreasi yang lebih beragam.",
    image:
      "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&q=80",
    brandLogo: "",
    brandName: "OFI",
    link: "/products?cat=nuts",
    color: "#795548",
    sortIndex: 4,
  },
  {
    title: "Chocolate",
    description:
      "Cokelat berkualitas tinggi dengan rasa lezat dan tekstur sempurna untuk berbagai kebutuhan.",
    image:
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80",
    brandLogo: "",
    brandName: "Le Bourne",
    link: "/products?cat=choco",
    color: "#3E2723",
    sortIndex: 5,
  },
  {
    title: "Raisin",
    description:
      "Kismis berkualitas dari pilihan terbaik untuk rasa manis alami dan tekstur yang sempurna.",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
    brandLogo: "",
    brandName: "KingLand",
    link: "/products?cat=raisin",
    color: "#827717",
    sortIndex: 6,
  },
];

function BrandChoiceModal({ card, onClose }: { card: PartnerCard; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-[22px] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
          <div>
            <h3 className="text-[18px] font-bold leading-tight text-[#2D4A22]">{card.title}</h3>
            <p className="mt-1 text-[12px] tracking-[0.08em] text-[#8B6F47]">Choose a brand to view products</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2D4A22]/5 text-[#2D4A22] transition hover:bg-[#2D4A22]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-2 p-5 sm:p-6">
          {(card.brands ?? []).map((b) => (
            <Link
              key={b.id}
              href={`/products?brand=${b.id}`}
              className="group flex items-center gap-3 rounded-[16px] border border-[#2D4A22]/10 p-3 transition hover:border-[#2D4A22]/30 hover:bg-[#2D4A22]/[0.03]"
            >
              {b.logo ? (
                <span className="relative h-10 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F5EFE0]">
                  <Image src={b.logo} alt={b.name} fill sizes="96px" className="object-contain p-1" />
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#2D4A22]">{b.name}</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#2D4A22] text-white transition group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PartnerCard({ card, index }: { card: PartnerCard; index: number }) {
  // Semantics: color = solid card background,
  // background = single right-side product visual,
  // images[] = bottom-bar logos (more than one)
  // 2+ brands -> click opens brand-choice modal instead of direct navigation.
  const [open, setOpen] = useState(false);
  const href = card.link;
  const multi = (card.brands ?? []).length > 1;
  const rightVisual =
    card.background && card.background.trim() !== "" ? card.background : "";
  const bottomLogos =
    Array.isArray(card.images) && card.images.filter(Boolean).length
      ? card.images.filter(Boolean)
      : card.brandLogo && card.brandLogo.trim() !== ""
        ? [card.brandLogo]
        : card.image
          ? [card.image]
          : [];
  const body = (
    <>
        {/* header: title + arrow */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white text-[22px] font-bold leading-tight">
              {card.title}
            </h3>
            <div className="mt-2 h-[3px] w-10 bg-white/90" />
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-5 w-5 text-black" />
          </div>
        </div>

        {/* body: description left, single product visual right (from background) */}
        <div className="mt-4 flex flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 text-white/95 text-[15px] leading-relaxed">
            {card.description}
          </p>
           {rightVisual !== "" && (
             <div className="w-full shrink-0 sm:w-[42%]">
               <div className="relative aspect-square w-full">
                  <Image
                    src={rightVisual}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                    fill
                    sizes="(max-width: 640px) 90vw, 400px"
                    unoptimized={rightVisual.includes("r2.dev")}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
               </div>
             </div>
           )}
        </div>

        {/* bottom logo bar */}
         <div className="mt-5 rounded-[16px] bg-[#CFC6B8] px-4 py-3">
           {bottomLogos.length > 0 ? (
             <div className="flex flex-row items-center justify-center gap-x-6 gap-y-2">
                {bottomLogos.slice(0, 4).map((src, i) => (
                  <div key={src + i} className="relative h-12 w-[150px] max-w-full shrink-0">
                    <Image
                      src={src}
                      alt={
                        i === 0 ? card.brandName : `${card.brandName} logo ${i + 1}`
                      }
                      fill
                      sizes="120px"
                      unoptimized={src.includes("r2.dev")}
                      className="object-contain"
                      onError={(e) => {
                        const box = (e.currentTarget as HTMLImageElement).parentElement;
                        if (box) box.style.display = "none";
                      }}
                    />
                  </div>
                ))}
               {bottomLogos.length > 4 && (
                 <span className="text-[11px] font-medium text-black/60">
                   +{bottomLogos.length - 4}
                 </span>
               )}
             </div>
           ) : (
             <p className="text-center text-sm font-semibold text-black/70">
               {card.brandName}
             </p>
           )}
         </div>
    </>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="group relative overflow-hidden rounded-[22px] shadow-lg"
      style={{ background: card.color }}
    >
      {multi ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-full min-h-[320px] w-full flex-col p-5 pb-4 text-left sm:p-6 sm:pb-4"
        >
          {body}
        </button>
      ) : (
        <Link
          href={href}
          className="flex h-full min-h-[320px] flex-col p-5 pb-4 sm:p-6 sm:pb-4"
        >
          {body}
        </Link>
      )}
      <AnimatePresence>
        {open && <BrandChoiceModal card={card} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

type BrandTile = {
  slug: string;
  title: string;
  img: string;
  desc?: string;
  brandIds: string[];
};

function RetailBrandSection() {
  const { t } = useLang();
  const { homeBrands } = useStore();

  const tiles: BrandTile[] = sortByLandingOrder(homeBrands ?? [])
    .map((h) => ({
      slug: h.id,
      title: h.name,
      img: h.image,
      desc: h.desc,
      brandIds: h.brandIds ?? [],
    }))
    .filter((h) => h.slug && h.img?.trim())
    .slice(0, 6);
  if (!tiles.length) return null;

  const brandLink = (brandIds: string[]) =>
    brandIds.length > 0 ? `/products?brand=${brandIds.join(",")}` : "/products";

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center mb-12">
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl text-[#2D4A22] mb-6">
                {t.homeRetailTitle}
              </h2>
             <div className="flex justify-center">
               <Image
                 src="https://cdn-naturafoods.alvineitsolutions.com/LOGO%20AVANTE%20FIX%20FINAL.png"
                 alt="Avante Ingredients Series"
                 width={320}
                 height={160}
                 style={{ width: "auto" }}
                 className="h-32 w-auto object-contain sm:h-40"
               />
             </div>
           </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 sm:gap-6">
            {tiles.map((item, i) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                 <Link
                   href={brandLink(item.brandIds)}
                   className="block w-full h-full"
                 >
                   <Image
                     src={item.img}
                     alt={item.title}
                     className="w-full h-full object-cover hover:scale-150 transition-transform duration-300"
                     width={200}
                     height={200}
                   />
                 </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type SmallPackTile = { slug: string; title: string; img: string };

function SmallPackSection() {
  const { t } = useLang();
  const { products } = useStore();

  const tiles: SmallPackTile[] = sortByLandingOrder(
    (products ?? []).filter((p) => p.type === "small-pack"),
  )
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      img: p.img,
    }))
    .filter((p) => p.slug && p.img?.trim());
  if (!tiles.length) return null;

  const doubled = [...tiles, ...tiles];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-[#2D4A22] mb-4">
              {t.homeSmallPackTitle}
            </h2>
            <div className="mx-auto max-w-xl aspect-video rounded-xl overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/7NYnW0M_obg?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3"
                title={t.homeSmallPackTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </Reveal>

        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: tiles.length * 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex w-max gap-2"
          >
            {doubled.map((item, i) => (
              <div
                key={item.slug + i}
                className="w-[180px] shrink-0 rounded-2xl p-4"
              >
                 <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <Image
                     src={item.img}
                     alt={item.title}
                     className="w-full h-full object-cover"
                     width={180}
                     height={240}
                   />
                 </div>
                {/* <p className="text-sm text-center text-[#2D4A22] font-medium truncate">
                  {item.title}
                </p> */}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type CocoaProduct = {
  code: string;
  brand: string;
  brandLogo: string;
  description: string;
  image: string;
  slug: string;
  file?: string;
};

const barryCallebautProducts: CocoaProduct[] = [];

const bensdorpProducts: CocoaProduct[] = [];

function CocoaProductCard({
  product,
  index,
}: {
  product: CocoaProduct;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
       <div className="aspect-[4/3] overflow-hidden">
         <Image
           src={product.image}
           alt={product.code}
           className="w-full h-full object-cover"
           width={400}
           height={300}
         />
       </div>
      <div className="p-4">
         <div className="flex items-center justify-between mb-2">
           <span className="font-semibold text-[#2D4A22]">{product.code}</span>
           {product.brandLogo ? (
             <Image
               src={product.brandLogo}
               alt={product.brand}
               width={96}
               height={24}
               style={{ width: "auto" }}
               className="h-6 w-auto object-contain"
             />
           ) : null}
         </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          {product.description}
        </p>
        <div className="flex gap-2">
          <a
            href={product.file || "#"}
            className="text-xs text-[#2D4A22] underline hover:no-underline"
          >
            Download Product
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function CocoaPowderSeriesSection() {
  const { products, productCategories } = useStore();

  const highlightedCategories = sortByLandingOrder(
    (productCategories ?? []).filter((c) => c.isHighlight && c.isActive),
  );

  if (highlightedCategories.length === 0) return null;

  const sections = highlightedCategories
    .map((cat) => ({
      category: cat,
      products: sortByLandingOrder(
        (products ?? []).filter((p) => p.cat === cat.slug),
      ).slice(0, 4),
    }))
    .filter((s) => s.products.length > 0);

  if (sections.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        {sections.map((section, sIdx) => (
          <Reveal key={section.category.id} delay={sIdx * 0.1}>
            <Reveal>
               <div className="mb-2 flex flex-col items-center gap-4 text-center sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                 <Image
                   src="/logo.png"
                   alt="NaturaFoods"
                   width={335}
                   height={102}
                   style={{ width: "auto" }}
                   className="h-10 w-auto object-contain sm:h-12"
                 />
                 <h2 className="text-center font-[var(--font-display)] text-2xl leading-tight sm:text-3xl md:text-4xl text-[#2D4A22]">
                  {section.category.name}
                  <br />
                  <span className="text-[20px] text-[#2D4A22]/80 font-normal">
                    {section.category?.description || ""}
                  </span>
                </h2>
              </div>
            </Reveal>
            <Reveal>
              <div className={sIdx > 0 ? "border-t border-gray-200 pt-12" : ""}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {section.products.map((product, index) => (
                    <CocoaProductCard
                      key={`${product.slug}-${index}`}
                      product={{
                        code: product.title,
                        brand: section.category.name,
                        brandLogo: "",
                        description: product.desc,
                        image: product.img,
                        slug: product.slug,
                        file: product.file ?? undefined,
                      }}
                      index={index}
                    />
                  ))}
                </div>
                <div className="mt-6 mb-12">
                  <ContactInfoSection />
                </div>
              </div>
            </Reveal>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Normalize for loose id/name matching: "Japanese Tea Series" -> "japaneseteaseries"
const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export default function OfficialPartnersSection() {
  const { t } = useLang();
  const { officialPartners, masterBrands, homeBrands, productCategories, products } = useStore();
  const sourcePartners = officialPartners ?? SEED_OFFICIAL_PARTNERS;
  const publishedPartners = sortOfficialPartners(
    sourcePartners.filter((p) => p.isPublished !== false),
  );
  useEffect(() => {
    // runs in browser — check browser DevTools console, not `next dev` terminal
    console.log("[OfficialPartners] published:", publishedPartners.map((p) => ({
      id: p.id,
      brandIds: (p as unknown as Record<string, unknown>).brandIds,
      brand_ids: (p as unknown as Record<string, unknown>).brand_ids,
      link: p.link,
    })));
  }, [officialPartners]);
  // Map OfficialPartner (color=card bg, background=single right visual, images[]=bottom logos) -> PartnerCard
  // Click destination precedence:
  // 1. explicit link override — honored even with 2+ brands (admin's explicit choice)
  // 2. explicit brandIds — 1 brand goes direct, 2+ open brand-choice modal
  // 3. derived brands: live partner rows often have empty brandIds, so derive
  //    from products whose category matches the partner (1 → direct, 2+ → modal)
  // 4. product category match (cards often titled by category)
  // 5. master brand / home brand id-name match
  // 6. "/products" (external links ignored — card stays in-site)
  const catForPartner = (p: OfficialPartner): { slug: string; id: string } | null => {
    const keys = [p.id, p.name].map(normKey).filter(Boolean);
    // bidirectional match: "Cocoa Powder" ↔ "cocoa-powder-series" / "super-premium-cocoa-powder"
    // exact > prefix > substring; ties prefer the shorter slug (more direct title match)
    const matchScore = (candidate?: string): number => {
      const n = normKey(candidate ?? "");
      if (!n) return 0;
      let best = 0;
      for (const k of keys) {
        if (k === n) best = Math.max(best, 3);
        else if (k.startsWith(n) || n.startsWith(k)) best = Math.max(best, 2);
        else if (k.includes(n) || n.includes(k)) best = Math.max(best, 1);
      }
      return best;
    };
    let cat: { slug: string; id: string; score: number } | null = null;
    for (const c of productCategories) {
      if (!c.isActive) continue;
      const score = Math.max(matchScore(c.id), matchScore(c.slug), matchScore(c.name));
      if (score <= 0) continue;
      if (
        !cat ||
        score > cat.score ||
        (score === cat.score && c.slug.length < cat.slug.length)
      ) {
        cat = { slug: c.slug, id: c.id, score };
      }
    }
    return cat ? { slug: cat.slug, id: cat.id } : null;
  };
  const partnerBrands = (p: OfficialPartner): PartnerBrand[] => {
    console.log("Partner", p)
    // Gate on raw brandIds, not on masterBrands lookup — lookup may be
    // empty/stale on landing while partner rows already carry brand_ids.
    const ids = (p.brandIds ?? []).filter(Boolean);
    if (ids.length > 0) {
      const logos = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      return ids.map((id, i) => {
        const mb = masterBrands.find((b) => b.id === id);
        return {
          id,
          name: mb?.name ?? id,
          logo: mb?.logo ?? logos[i] ?? p.image ?? "",
        };
      });
    }
    // Live rows often have empty brandIds — derive from products in the
    // partner's category so the modal can offer each distinct brand.
    const cat = catForPartner(p);
    if (!cat) return [];
    const seen = new Map<string, PartnerBrand>();
    for (const pr of products) {
      if (pr.cat !== cat.slug) continue;
      const bid = pr.brandId;
      if (!bid || seen.has(bid)) continue;
      const mb = masterBrands.find((b) => b.id === bid);
      const brandName =
        mb?.name ?? (typeof pr.brand === "string" ? pr.brand : pr.brand?.name) ?? bid;
      seen.set(bid, {
        id: bid,
        name: brandName,
        logo: mb?.logo ?? "",
      });
    }
    return [...seen.values()];
  };
  const partnerLink = (p: OfficialPartner, brands: PartnerBrand[]) => {
    if (typeof p.link === "string" && p.link.startsWith("/")) return p.link;

    if (brands.length === 1) return `/products?brand=${brands[0].id}`;
    // 2+ brands: modal handles navigation; link unused but keep category fallback
    // so non-JS / static contexts still land somewhere sensible.

    const keys = [p.id, p.name].map(normKey).filter(Boolean);
    // bidirectional match: "Cocoa Powder" ↔ "cocoa-powder-series" / "super-premium-cocoa-powder"
    // exact > prefix > substring; ties prefer the shorter slug (more direct title match)
    const matchScore = (candidate?: string): number => {
      const n = normKey(candidate ?? "");
      if (!n) return 0;
      let best = 0;
      for (const k of keys) {
        if (k === n) best = Math.max(best, 3);
        else if (k.startsWith(n) || n.startsWith(k)) best = Math.max(best, 2);
        else if (k.includes(n) || n.includes(k)) best = Math.max(best, 1);
      }
      return best;
    };

    let cat: { slug: string; score: number } | null = null;
    for (const c of productCategories) {
      if (!c.isActive) continue;
      const score = Math.max(matchScore(c.id), matchScore(c.slug), matchScore(c.name));
      if (score <= 0) continue;
      if (
        !cat ||
        score > cat.score ||
        (score === cat.score && c.slug.length < cat.slug.length)
      ) {
        cat = { slug: c.slug, score };
      }
    }
    if (cat) return `/products?cat=${cat.slug}`;

    const matches = (candidates: (string | undefined)[]) =>
      candidates.some((c) => matchScore(c) > 0);

    const mb = masterBrands.find((b) => matches([b.id, b.slug, b.name]));
    if (mb) return `/products?brand=${mb.id}`;

    const hb = homeBrands.find((h) => matches([h.id, h.name]) && (h.brandIds ?? []).length > 0);
    if (hb) return `/products?brand=${(hb.brandIds ?? []).join(",")}`;

    return "/products";
  };
  const cards: PartnerCard[] = publishedPartners.length
    ? publishedPartners.map((p) => {
        const brands = partnerBrands(p);
        const rightVisual = p.background || "";
        const bottomLogos =
          Array.isArray(p.images) && p.images.filter(Boolean).length
            ? p.images.filter(Boolean)
            : p.image
              ? [p.image]
              : [];
        return {
          title: p.name,
          description: p.description,
          image:
            p.image ||
            bottomLogos[0] ||
            `https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80`,
          brandLogo: bottomLogos[0] || p.image || "",
          brandName: p.name,
          link: partnerLink(p, brands),
          brandIds: (p.brandIds ?? []).filter(Boolean),
          brands,
          color:
            typeof p.color === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(p.color.trim())
              ? p.color.trim()
              : stringToColor(p.id),
          background: rightVisual,
          images: bottomLogos.length ? bottomLogos : undefined,
          sortIndex: p.sortIndex ?? p.order ?? 0,
        };
      })
    : [...partnerCards].sort((a, b) => a.sortIndex - b.sortIndex).map((c) => ({
        ...c,
        background: undefined,
      }));

  // Fallback to static cards if no dynamic partners published
  const displayCards = cards.length ? cards : partnerCards;

  return (
    <>
      {/* Official Partner For Indonesia Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[white] to-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          <Reveal>
             <div className="text-center mb-10 sm:mb-12">
               <div className="flex items-center justify-center gap-4 mb-6">
                  <Image
                    src="/logo.png"
                    alt="NaturaFoods"
                    width={335}
                    height={102}
                    style={{ width: "auto" }}
                    className="h-12 w-auto object-contain sm:h-16"
                    priority
                  />
               </div>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-[#2D4A22] mb-4">
                {t.homePartnersTitle}
              </h2>
              <p className="max-w-2xl mx-auto text-[#1a1a16]/60 text-sm sm:text-base leading-relaxed">
                {t.homePartnersDesc}
              </p>
            </div>
          </Reveal>

          {displayCards.length === 0 ? (
            <p className="text-center text-sm text-[#8B6F47]">
              {t.homeNoPartners}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayCards.map((card, index) => (
                <PartnerCard
                  key={card.title + index}
                  card={card}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <RetailBrandSection />
      <SmallPackSection />
      <CocoaPowderSeriesSection />
    </>
  );
}
