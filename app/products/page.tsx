"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import SalesContactCard from "../components/SalesContactCard";
import { useLang } from "../i18n";
import type { Product } from "../lib/data";
import { apiFetch, buildQuery } from "../lib/api";
import { useStore } from "../lib/store";

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white animate-pulse">
      <div className="aspect-[4/3] bg-[#F5EFE0]" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-4 bg-[#F5EFE0] rounded w-3/4" />
        <div className="h-3 bg-[#F5EFE0] rounded w-1/2" />
        <div className="h-3 bg-[#F5EFE0] rounded w-full" />
        <div className="h-3 bg-[#F5EFE0] rounded w-2/3" />
      </div>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Products" }]} />
      <PageHeader eyebrow="..." title="..." desc="..." />
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
        <aside className="hidden lg:block lg:w-[240px] lg:shrink-0 lg:sticky lg:top-[80px] lg:self-start">
          <div className="rounded-[16px] border border-[#2D4A22]/8 bg-white overflow-hidden animate-pulse">
            <div className="p-4 pb-3">
              <div className="h-2.5 bg-[#F5EFE0] rounded w-16 mb-3" />
              <div className="flex flex-col gap-1">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-[#F5EFE0] rounded-[10px]" />)}
              </div>
            </div>
            <div className="mx-4 border-t border-[#2D4A22]/6" />
            <div className="p-4 pt-3 pb-3">
              <div className="h-2.5 bg-[#F5EFE0] rounded w-12 mb-3" />
              <div className="flex flex-col gap-1">
                {[1, 2].map((i) => <div key={i} className="h-8 bg-[#F5EFE0] rounded-[10px]" />)}
              </div>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function loadProducts(): Product[] {
  try { const v = localStorage.getItem("nf_products"); if (v) return JSON.parse(v); } catch {}
  return [];
}

function ProductsInner() {
  const { t } = useLang();
  const p = t.productsPage;
  const sp = useSearchParams();
  const { productCategories, masterBrands } = useStore();
  const initialCat = sp.get("cat") ?? null;
  const initialBrands = sp.get("brand")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const [cat, setCat] = useState<string>(initialCat ?? "all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [items, setItems] = useState<Product[]>([]);
  const [apiItems, setApiItems] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setItems(loadProducts()); if (initialCat) setCat(initialCat); }, [initialCat, initialBrands.join(",")]);

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  // API fetch — FRONTEND_API_GUIDE.md:3 GET /products with filters
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const brandParam = selectedBrands.length > 0 ? selectedBrands.join(",") : undefined;
    // server ignores ?cat= — it filters on categoryId only (verified against live API)
    const catId = cat !== "all" ? productCategories.find((c) => c.slug === cat)?.id : undefined;
    const q = buildQuery({ categoryId: catId, brandId: brandParam, limit: 50, sort: "createdAt:desc" });
    apiFetch<Product[]>(`/products${q}`)
      .then((json) => {
        if (!cancelled && json.success && Array.isArray(json.data)) {
          const norm = (json.data as unknown as Record<string, unknown>[]).map((raw) => {
            const catObj = raw.category as { slug?: unknown } | undefined;
            return {
              slug: String(raw.slug ?? raw.id ?? ""),
              // API returns category.slug — top-level `cat` no longer exists
              cat: String(raw.cat ?? catObj?.slug ?? ""),
              title: String(raw.title ?? ""),
              note: String(raw.note ?? ""),
              tag: String(raw.tag ?? ""),
              img: String(raw.img ?? raw.image ?? ""),
              desc: String(raw.desc ?? raw.description ?? ""),
              type: (raw.type as Product["type"]) ?? "general",
              isHighlight: Boolean(raw.isHighlight ?? false),
              brandId: (raw.brandId as string) ?? ((raw.brand as Record<string, unknown>)?.id as string) ?? null,
            } as Product;
          });
          setApiItems(norm.filter((x) => x.slug));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cat, selectedBrands.join(","), productCategories]);

  const source = apiItems ?? items;
  const filtered = source.filter((x) => (cat === "all" || x.cat === cat) && (selectedBrands.length === 0 || selectedBrands.includes(x.brandId ?? "")));
  const cats = [
    ["all", p.all],
    ...productCategories.filter((c) => c.isActive).map((c) => [c.slug, c.name] as const),
  ];
  const brands = [
    ["all", "All Brands"],
    ...masterBrands.filter((b) => b.isActive).map((b) => [b.id, b.name] as const),
  ];
  const hasActive = cat !== "all" || selectedBrands.length > 0;
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Products" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />

      {/* Mobile filter — unified scrollable bar */}
      <div className="mb-8 lg:hidden">
        <div className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 snap-x snap-mandatory scrollbar-none">
          {cats.map(([k, label]) => (
            <button
              key={`cat-${k}`}
              onClick={() => setCat(k)}
              aria-pressed={cat === k}
              className={`shrink-0 snap-start rounded-full border px-4 py-2 text-[11px] tracking-[0.12em] min-h-[38px] whitespace-nowrap transition-all ${cat === k ? "bg-[#2D4A22] text-white border-[#2D4A22] shadow-[0_2px_8px_rgba(45,74,34,0.18)]" : "bg-white text-[#2D4A22] border-[#2D4A22]/12 hover:border-[#2D4A22]/25 active:scale-[0.97]"}`}
            >
              {label}
            </button>
          ))}
          {brands.length > 1 && (
            <>
              <span className="shrink-0 self-center w-px h-5 bg-[#2D4A22]/10" />
              {brands.map(([k, label]) => {
                const isActive = k === "all" ? selectedBrands.length === 0 : selectedBrands.includes(k);
                return (
                <button
                  key={`brand-${k}`}
                  onClick={() => k === "all" ? setSelectedBrands([]) : toggleBrand(k)}
                  aria-pressed={isActive}
                  className={`shrink-0 snap-start rounded-full border px-4 py-2 text-[11px] tracking-[0.12em] min-h-[38px] whitespace-nowrap transition-all ${isActive ? "bg-[#8B6F47] text-white border-[#8B6F47] shadow-[0_2px_8px_rgba(139,111,71,0.18)]" : "bg-white text-[#8B6F47] border-[#8B6F47]/12 hover:border-[#8B6F47]/25 active:scale-[0.97]"}`}
                >
                  {label}
                </button>
                );
              })}
            </>
          )}
        </div>
        {hasActive && (
          <button onClick={() => { setCat("all"); setSelectedBrands([]); }} className="mt-2 text-[11px] tracking-[0.06em] text-[#8B6F47] underline underline-offset-2 hover:text-[#2D4A22] transition-colors">Clear filters</button>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
        {/* Desktop sidebar — sticky filter panel */}
        <aside className="hidden lg:block lg:w-[240px] lg:shrink-0 lg:sticky lg:top-[80px] lg:self-start">
          <div className="rounded-[16px] border border-[#2D4A22]/8 bg-white overflow-hidden">
            {/* Categories */}
            <div className="p-4 pb-3">
              <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/70 mb-2.5">Category</p>
              <div className="flex flex-col gap-0.5">
                {cats.map(([k, label]) => {
                  const isActive = cat === k;
                  const count = k === "all" ? source.length : source.filter((x) => x.cat === k).length;
                  return (
                    <button
                      key={k}
                      onClick={() => setCat(k)}
                      aria-pressed={isActive}
                      className={`group flex items-center justify-between rounded-[10px] px-3 py-2 text-left text-[12px] transition-all ${isActive ? "bg-[#2D4A22] text-white" : "text-[#2D4A22] hover:bg-[#2D4A22]/[0.04]"}`}
                    >
                      <span className="tracking-[0.06em]">{label}</span>
                      <span className={`text-[10px] tabular-nums ${isActive ? "text-white/60" : "text-[#8B6F47]/40 group-hover:text-[#8B6F47]/60"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-[#2D4A22]/6" />

            {/* Brands */}
            {brands.length > 1 && (
              <div className="p-4 pt-3 pb-3">
                <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/70 mb-2.5">Brand</p>
                <div className="flex flex-col gap-0.5">
                  {brands.map(([k, label]) => {
                    const isActive = k === "all" ? selectedBrands.length === 0 : selectedBrands.includes(k);
                    const count = k === "all" ? source.length : source.filter((x) => x.brandId === k).length;
                    return (
                      <button
                        key={`brand-${k}`}
                        onClick={() => k === "all" ? setSelectedBrands([]) : toggleBrand(k)}
                        aria-pressed={isActive}
                        className={`group flex items-center justify-between rounded-[10px] px-3 py-2 text-left text-[12px] transition-all ${isActive ? "bg-[#8B6F47] text-white" : "text-[#8B6F47] hover:bg-[#8B6F47]/[0.06]"}`}
                      >
                        <span className="tracking-[0.06em]">{label}</span>
                        <span className={`text-[10px] tabular-nums ${isActive ? "text-white/60" : "text-[#8B6F47]/40 group-hover:text-[#8B6F47]/60"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer — count + clear */}
            <div className="mx-4 border-t border-[#2D4A22]/6" />
            <div className="p-4 flex items-center justify-between">
              <p className="text-[11px] text-[#8B6F47]"><span className="font-medium text-[#2D4A22]">{filtered.length}</span> {filtered.length === 1 ? "product" : "products"}</p>
              {hasActive && (
                <button onClick={() => { setCat("all"); setSelectedBrands([]); }} className="text-[10px] tracking-[0.08em] text-[#8B6F47] underline underline-offset-2 hover:text-[#2D4A22] transition-colors">Clear</button>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((pr) => {
          const src = pr.img?.trim() ? pr.img : null;
          const isVideo = !!src && (src.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(src));
          return (
          <Link key={pr.slug} href={`/products/${pr.slug}`} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white transition hover:border-[#2D4A22]/20 hover:shadow-[0_8px_24px_rgba(45,74,34,0.08)]">
            <div className="aspect-[4/3] overflow-hidden bg-[#F5EFE0]">{src ? (isVideo ? <video src={src} autoPlay muted loop playsInline className="h-full w-full object-cover" /> : <Image src={src} alt={pr.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" width={400} height={300} />) : <div className="grid h-full w-full place-items-center bg-[#F5EFE0] text-[11px] tracking-[0.14em] text-[#8B6F47]">No image</div>}</div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-medium text-[#2D4A22] text-[14px] sm:text-[15px] break-words group-hover:underline decoration-[#2D4A22]/20 underline-offset-4">{pr.title}</h3><p className="mt-1 text-[12px] text-[#8B6F47]">{pr.note}</p><p className="mt-2 text-[12px] leading-5 text-[#1a1a16]/60">{pr.desc}</p></div><span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 sm:px-3 py-1 text-[10px] font-medium text-white">{pr.tag}</span></div>
            </div>
          </Link>
          );
        })}
          </div>
          {filtered.length === 0 && <p className="py-12 text-center text-[13px] text-[#8B6F47]">{t.admin.noData}</p>}
          <SalesContactCard />
        </div>
      </div>
    </PageShell>
  );
}
export default function ProductsPage() {
  return <Suspense fallback={<ProductsSkeleton />}><ProductsInner /></Suspense>;
}
