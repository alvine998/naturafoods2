"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";
import { SEED_ARTICLES } from "../lib/data";
import type { Article } from "../lib/data";

export default function ArticlesPage() {
  const { t } = useLang();
  const p = t.articlesPage;
  const [items, setItems] = useState<Article[]>(SEED_ARTICLES);
  useEffect(() => { try { const v = localStorage.getItem("nf_articles"); if (v) setItems(JSON.parse(v)); } catch {} }, []);
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Articles" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      {items.length === 0 ? <p className="py-12 text-center text-[13px] text-[#8B6F47]">{p.empty}</p> : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <Link key={a.slug} href={`/articles/${a.slug}`} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white hover:shadow-lg transition">
              <div className="aspect-[16/10] overflow-hidden bg-[#F5EFE0]"><img src={a.img} alt={a.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" /></div>
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-[#8B6F47]"><span className="rounded-full bg-[#FFFCF2] border border-[#2D4A22]/10 px-2.5 py-1">{a.category}</span><span>{a.date}</span></div>
                <h3 className="mt-3 font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] break-words">{a.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60 line-clamp-2">{a.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4">{p.readMore} <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
