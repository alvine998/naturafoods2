"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "../lib/store";
import { useLang } from "../i18n";
import { SEED_OFFICIAL_PARTNERS } from "../lib/data";
import type { OfficialPartner } from "../lib/data";

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
  },
];

function PartnerCard({ card, index }: { card: PartnerCard; index: number }) {
  // Semantics: color = solid card background,
  // background = single right-side product visual,
  // images[] = bottom-bar logos (more than one)
  // brandIds[] is informational only — destination comes from card.link
  // (partnerLink already prefers category over brandIds).
  const href = card.link;
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
      <Link
        href={href}
        // target="_blank"
        // rel="noopener noreferrer"
        className="flex h-full min-h-[320px] flex-col p-5 pb-4 sm:p-6 sm:pb-4"
      >
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
      </Link>
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

  const tiles: BrandTile[] = (homeBrands ?? [])
    .slice(0, 6)
    .map((h) => ({
      slug: h.id,
      title: h.name,
      img: h.image,
      desc: h.desc,
      brandIds: h.brandIds ?? [],
    }))
    .filter((h) => h.slug && h.img?.trim());
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

  const tiles: SmallPackTile[] = (products ?? [])
    .filter((p) => p.type === "small-pack")
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

type ContactPerson = {
  region: string;
  name: string;
  title: string;
  whatsapp: string;
  email: string;
  avatar: string;
  gender?: string;
};

const barryCallebautProducts: CocoaProduct[] = [];

const bensdorpProducts: CocoaProduct[] = [];

const contactPersons: ContactPerson[] = [
  {
    region: "West Indonesia",
    name: "Mr. M. Iswarno",
    title: "Regional Manager Area",
    whatsapp: "+6281234567890",
    email: "iswarno@naturafoods.id",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    gender: "male",
  },
  {
    region: "Center Indonesia",
    name: "Mr. Dili Wijaya",
    title: "Regional Manager Area",
    whatsapp: "+6281234567891",
    email: "dili@naturafoods.id",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    gender: "male",
  },
  {
    region: "East Indonesia",
    name: "Mr. Robert Franz",
    title: "Regional Manager Area",
    whatsapp: "+6281234567892",
    email: "robert@naturafoods.id",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
    gender: "male",
  },
];

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

function ContactCard({
  contact,
  index,
}: {
  contact: ContactPerson;
  index: number;
}) {
  const prefix = contact.gender?.toLowerCase() === "female" ? "Ms." : "Mr.";
  const displayName = contact.name
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "")
    .trim();
  return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.5, delay: index * 0.1 }}
       className="flex flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-md min-[420px]:flex-row min-[420px]:items-center"
     >
        <Image
          src={contact.avatar}
          alt={contact.name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover"
          unoptimized={contact.avatar.includes("r2.dev")}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
       <div className="min-w-0 flex-1">
        <p className="font-medium text-[#2D4A22]">{contact.region}</p>
        <p className="text-sm font-semibold text-gray-800">
          {prefix} {displayName}
        </p>
        <p className="text-xs text-gray-500 mb-2">{contact.title}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <a
            href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}
            className="flex items-center gap-1 text-xs text-green-600 hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Whatsapp
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            E-mail
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function CocoaPowderSeriesSection() {
  const { products, productCategories } = useStore();

  const highlightedCategories = (productCategories ?? []).filter(
    (c) => c.isHighlight && c.isActive,
  );

  if (highlightedCategories.length === 0) return null;

  const sections = highlightedCategories
    .map((cat) => ({
      category: cat,
      products: (products ?? []).filter((p) => p.cat === cat.slug).slice(0, 4),
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

function ContactInfoSection() {
  const { t } = useLang();
  const { salesContacts } = useStore();

  const contacts: ContactPerson[] = (salesContacts ?? [])
    .filter((c) => c.published !== false)
    .map((s) => ({
      region: String(s.location ?? ""),
      name: String(s.name ?? ""),
      title: String(s.position ?? ""),
      whatsapp: String(s.whatsapp ?? ""),
      email: String(s.email ?? ""),
      avatar: String(s.photo ?? ""),
      gender: String(s.gender ?? ""),
    }))
    .filter((c) => c.name && (c.whatsapp || c.email));

  if (!contacts.length) return null;
  return (
    <div className="mt-8">
      <h4 className="text-center text-xl font-semibold text-[#2D4A22] mb-6">
        {t.homeContactInfoTitle}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map((contact, index) => (
          <ContactCard key={contact.name} contact={contact} index={index} />
        ))}
      </div>
    </div>
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
  const { officialPartners, masterBrands, homeBrands, productCategories } = useStore();
  const sourcePartners = officialPartners ?? SEED_OFFICIAL_PARTNERS;
  const publishedPartners = sourcePartners
    .filter((p) => p.isPublished !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
  // 1. internal link override (e.g. "/products?cat=…" or "/products?brand=<uuid>")
  // 2. product category match by partner id/name — partner cards are titled by
  //    category ("Cocoa Powder"), so category must beat brand fuzzy-match
  // 3. brandIds -> /products?brand=a,b (products page calls API with ?brandId=a,b)
  // 4. master brand / home brand id-name match (live partners often have empty brandIds)
  // 5. "/products" (external links ignored — card stays in-site)
  const partnerLink = (p: OfficialPartner) => {
    if (typeof p.link === "string" && p.link.startsWith("/")) return p.link;

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

    const ids = (p.brandIds ?? []).filter(Boolean);
    if (ids.length > 0) return `/products?brand=${ids.join(",")}`;

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
          link: partnerLink(p),
          brandIds: (p.brandIds ?? []).filter(Boolean), // kept for admin/debug; href uses link
          color:
            typeof p.color === "string" &&
            /^#[0-9a-fA-F]{6}$/.test(p.color.trim())
              ? p.color.trim()
              : stringToColor(p.id),
          background: rightVisual,
          images: bottomLogos.length ? bottomLogos : undefined,
        };
      })
    : partnerCards.map((c) => ({
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
