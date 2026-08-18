"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";
import { SEED_PRODUCTS } from "../lib/data";
import type { Product } from "../lib/data";

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
  useEffect(() => { setItems(loadProducts()); if (initial) setCat(initial); }, [initial]);
  const filtered = cat === "all" ? items : items.filter((x) => x.cat === cat);
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Products" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0 sm:overflow-visible">
        {([["all", p.all], ["choco", p.choco], ["matcha", p.matcha]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setCat(k)} className={`shrink-0 rounded-full px-4 sm:px-5 py-2 text-[11px] tracking-[0.14em] border ${cat === k ? "bg-[#2D4A22] text-white border-[#2D4A22]" : "bg-white text-[#2D4A22] border-[#2D4A22]/15 hover:bg-[#FFFCF2]"}`}>{label}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pr) => (
          <div key={pr.slug} className="overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-[#F5EFE0]"><img src={pr.img} alt={pr.title} loading="lazy" className="h-full w-full object-cover" /></div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-medium text-[#2D4A22] text-[14px] sm:text-[15px] break-words">{pr.title}</h3><p className="mt-1 text-[12px] text-[#8B6F47]">{pr.note}</p><p className="mt-2 text-[12px] leading-5 text-[#1a1a16]/60">{pr.desc}</p></div><span className="shrink-0 rounded-full bg-[#2D4A22] px-2.5 sm:px-3 py-1 text-[10px] font-medium text-white">{pr.tag}</span></div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="py-12 text-center text-[13px] text-[#8B6F47]">{t.admin.noData}</p>}
    </PageShell>
  );
}
export default function ProductsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#FFFCF2] p-12 text-center text-[#8B6F47]">…</div>}><ProductsInner /></Suspense>;
}
