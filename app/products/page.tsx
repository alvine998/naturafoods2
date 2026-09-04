"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import SalesContactCard from "../components/SalesContactCard";
import { useLang } from "../i18n";
import { SEED_PRODUCTS } from "../lib/data";
import type { Product } from "../lib/data";
import { apiFetch, buildQuery } from "../lib/api";

function loadProducts(): Product[] {
  try { const v = localStorage.getItem("nf_products"); if (v) return JSON.parse(v); } catch {}
  return SEED_PRODUCTS;
}

function ProductsInner() {
  const { t } = useLang();
  const p = t.productsPage;
  const sp = useSearchParams();
  const initial = (sp.get("cat") as "choco" | "matcha" | null) ?? null;
  const [cat, setCat] = useState<"all" | "choco" | "matcha">((initial as any) ?? "all");
  const [items, setItems] = useState<Product[]>(SEED_PRODUCTS);
  const [apiItems, setApiItems] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setItems(loadProducts()); if (initial) setCat(initial); }, [initial]);

  // API fetch — FRONTEND_API_GUIDE.md:3 GET /products with filters
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = buildQuery({ cat: cat !== "all" ? cat : undefined, limit: 50, sort: "createdAt:desc" });
    apiFetch<Product[]>(`/products${q}`)
      .then((json) => {
        if (!cancelled && json.success && Array.isArray(json.data)) {
          const norm = (json.data as unknown as Record<string, unknown>[]).map((raw) => ({
            slug: String(raw.slug ?? raw.id ?? ""),
            cat: (raw.cat as Product["cat"]) ?? "choco",
            title: String(raw.title ?? ""),
            note: String(raw.note ?? ""),
            tag: String(raw.tag ?? ""),
            img: String(raw.img ?? raw.image ?? ""),
            desc: String(raw.desc ?? raw.description ?? ""),
            type: (raw.type as Product["type"]) ?? "general",
            isHighlight: Boolean(raw.isHighlight ?? false),
          })) as Product[];
          setApiItems(norm.filter((x) => x.slug));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cat]);

  const source = apiItems ?? items;
  const filtered = cat === "all" ? source : source.filter((x) => x.cat === cat);
  const cats = [
    ["all", p.all],
    ["choco", p.choco],
    ["matcha", p.matcha],
  ] as const;
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Products" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      {loading && <p className="mb-3 text-[11px] text-[#8B6F47]">Loading from <code className="rounded bg-[#F5EFE0] px-1 py-0.5">GET /products{buildQuery({ cat: cat !== "all" ? cat : undefined })}</code>…</p>}
      {/* Mobile filter — horizontal scroll with snap, edge-to-edge bleed handling */}
      <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 snap-x snap-mandatory scrollbar-none sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none lg:hidden">
        {cats.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setCat(k)}
            aria-pressed={cat === k}
            className={`shrink-0 snap-start rounded-full border px-4 py-2.5 text-[11px] tracking-[0.14em] min-h-9 whitespace-nowrap transition ${cat === k ? "bg-[#2D4A22] text-white border-[#2D4A22] shadow-sm" : "bg-white text-[#2D4A22] border-[#2D4A22]/15 hover:border-[#2D4A22]/30 hover:bg-white active:scale-[0.98]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
        {/* Desktop sidebar — sticky category menu */}
        <aside className="hidden lg:block lg:w-[220px] lg:shrink-0 lg:sticky lg:top-[80px] lg:self-start">
          <div className="rounded-[20px] border border-[#2D4A22]/10 bg-white p-2 shadow-[0_2px_16px_rgba(45,74,34,0.06)]">
            <p className="px-3 pt-2 pb-1 text-[10px] tracking-[0.18em] text-[#8B6F47]">CATEGORIES</p>
            <div className="grid gap-1.5">
              {cats.map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCat(k)}
                  aria-pressed={cat === k}
                  className={`w-full rounded-full px-4 py-2.5 text-left text-[11px] tracking-[0.14em] border transition text-[#2D4A22] ${cat === k ? "bg-[#2D4A22] text-white border-[#2D4A22]" : "bg-white border-transparent hover:bg-[#2D4A22]/[0.06] hover:border-[#2D4A22]/10"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mx-3 mt-3 border-t border-[#2D4A22]/10 pt-3">
              <p className="text-[11px] leading-5 text-[#8B6F47]">{filtered.length} {filtered.length === 1 ? "product" : "products"} {apiItems ? "· API" : "· local"}</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((pr) => (
          <Link key={pr.slug} href={`/products/${pr.slug}`} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white transition hover:border-[#2D4A22]/20 hover:shadow-[0_8px_24px_rgba(45,74,34,0.08)]">
            <div className="aspect-[4/3] overflow-hidden bg-[#F5EFE0]">{pr.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(pr.img ?? "") ? <video src={pr.img} autoPlay muted loop playsInline className="h-full w-full object-cover" /> : <img src={pr.img} alt={pr.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />}</div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-medium text-[#2D4A22] text-[14px] sm:text-[15px] break-words group-hover:underline decoration-[#2D4A22]/20 underline-offset-4">{pr.title}</h3><p className="mt-1 text-[12px] text-[#8B6F47]">{pr.note}</p><p className="mt-2 text-[12px] leading-5 text-[#1a1a16]/60">{pr.desc}</p></div><span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 sm:px-3 py-1 text-[10px] font-medium text-white">{pr.tag}</span></div>
            </div>
          </Link>
        ))}
          </div>
          {filtered.length === 0 && <p className="py-12 text-center text-[13px] text-[#8B6F47]">{t.admin.noData}</p>}
          <SalesContactCard />
        </div>
      </div>
    </PageShell>
  );
}
export default function ProductsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white p-12 text-center text-[#8B6F47]">…</div>}><ProductsInner /></Suspense>;
}
