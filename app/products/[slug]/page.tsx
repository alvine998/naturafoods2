"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell, { Breadcrumbs } from "../../components/PageShell";
import SalesContactCard from "../../components/SalesContactCard";
import { ArrowLeft } from "lucide-react";
import { SEED_PRODUCTS } from "../../lib/data";
import type { Product } from "../../lib/data";
import { useLang } from "../../i18n";
import { apiFetch } from "../../lib/api";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLang();
  const [product, setProduct] = useState<Product | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Try API first: GET /products/:slug (FRONTEND_API_GUIDE.md:3)
      try {
        const json = await apiFetch<Product>(`/products/${encodeURIComponent(String(slug))}`);
        if (!cancelled && json.success && json.data && (json.data as Product).slug) {
          const raw = json.data as unknown as Record<string, unknown>;
          const norm: Product = {
            slug: String(raw.slug ?? raw.id ?? slug),
            cat: (raw.cat as Product["cat"]) ?? "choco",
            title: String(raw.title ?? ""),
            note: String(raw.note ?? ""),
            tag: String(raw.tag ?? ""),
            img: String(raw.img ?? raw.image ?? ""),
            desc: String(raw.desc ?? raw.description ?? ""),
            type: (raw.type as Product["type"]) ?? "general",
            isHighlight: Boolean(raw.isHighlight ?? false),
          };
          if (norm.title) {
            setProduct(norm);
            setDone(true);
            return;
          }
        }
      } catch {}
      // Fallback to localStorage / seed
      let list: Product[] = SEED_PRODUCTS;
      try { const v = localStorage.getItem("nf_products"); if (v) list = JSON.parse(v); } catch {}
      if (!cancelled) {
        setProduct(list.find((p) => p.slug === slug) ?? null);
        setDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);
  if (!done) return <PageShell><p className="py-12 text-center text-[#8B6F47]">…</p></PageShell>;
  if (!product) return <PageShell><Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: t.productDetail.notFound }]} /><p className="py-12 text-center text-[#8B6F47]">{t.productDetail.notFound}</p><Link href="/products" className="mx-auto mt-4 block w-fit rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] tracking-[0.14em] text-white">{t.productDetail.back}</Link></PageShell>;
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: product.title }]} />
      <Link href="/products" className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] hover:underline"><ArrowLeft className="h-3 w-3" /> {t.productsPage.title}</Link>
      <div className="mt-4 sm:mt-6 overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white border border-[#2D4A22]/10">
        <div className="aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-[#F5EFE0]">{product.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(product.img ?? "") ? <video src={product.img} controls className="h-full w-full object-cover" /> : <img src={product.img} alt={product.title} className="h-full w-full object-cover" />}</div>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#2D4A22] px-3 py-1 text-[10px] tracking-[0.14em] text-white uppercase">{product.cat}</span>
            <span className="rounded-full border border-[#2D4A22]/10 bg-white px-3 py-1 text-[11px] tracking-[0.08em] text-[#8B6F47]">{product.tag}</span>
            {product.isHighlight && <span className="rounded-full bg-[#2D4A22] px-2 py-1 text-[10px] text-white">★ Highlight</span>}
            {product.type && <span className="rounded-full border border-[#2D4A22]/10 bg-white px-2 py-1 text-[10px] text-[#2D4A22]">{product.type}</span>}
          </div>
          <h1 className="mt-3 sm:mt-4 font-[var(--font-display)] text-[24px] sm:text-[28px] md:text-[36px] font-light leading-none text-[#2D4A22] break-words">{product.title}</h1>
          <p className="mt-2 text-[12px] tracking-[0.06em] text-[#8B6F47]">{product.note}</p>
          <p className="mt-3 max-w-[65ch] text-[13px] sm:text-[14px] leading-6 text-[#1a1a16]/60">{product.desc}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] tracking-[0.14em] text-white hover:bg-[#1e3317]">{t.productDetail.requestPrice}</Link>
            <Link href="/products" className="inline-flex rounded-full border border-[#2D4A22]/15 bg-white px-6 py-2.5 text-[11px] tracking-[0.14em] text-[#2D4A22]">{t.productDetail.viewAll}</Link>
          </div>
        </div>
      </div>
      <SalesContactCard productTitle={product.title} />
    </PageShell>
  );
}
