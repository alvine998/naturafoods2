"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import PageShell, { PageHeader, Breadcrumbs } from "../components/PageShell";
import { useLang } from "../i18n";
import { SEED_ARTICLES } from "../lib/data";
import type { Article } from "../lib/data";
import { fetchPublicArticles } from "../lib/store";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesPage() {
  const { t } = useLang();
  const p = t.articlesPage;
  const [items, setItems] = useState<Article[]>(SEED_ARTICLES);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    // Instant paint from local cache, then overwrite with the full API list
    try { const v = localStorage.getItem("nf_articles"); if (v) setItems(JSON.parse(v)); } catch {}
    (async () => {
      const list = await fetchPublicArticles(50);
      if (cancelled) return;
      if (list?.length) setItems(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Articles" }]} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} desc={p.desc} />
      {loading ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-[26px] w-20 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="mt-3 h-4 w-4/5" />
                <Skeleton className="mt-2 h-4 w-3/5" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <Skeleton className="mt-4 h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? <p className="py-12 text-center text-[13px] text-[#8B6F47]">{p.empty}</p> : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => {
            const src = a.img?.trim() ? a.img : null;
            const isVideo = !!src && (src.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(src));
            return (
            <Link key={a.slug} href={`/articles/${a.slug}`} className="group overflow-hidden rounded-[20px] border border-[#2D4A22]/[0.07] bg-white hover:shadow-lg transition">
              <div className="aspect-[16/10] overflow-hidden bg-[#F5EFE0]">{src ? (isVideo ? <video src={src} muted className="h-full w-full object-cover" /> : <Image src={src} alt={a.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" width={640} height={400} />) : <div className="grid h-full w-full place-items-center bg-[#F5EFE0] text-[11px] tracking-[0.14em] text-[#8B6F47]">No image</div>}</div>
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-[#8B6F47]"><span className="rounded-full bg-white border border-[#2D4A22]/10 px-2.5 py-1">{a.category}</span><span>{a.date}</span></div>
                <h3 className="mt-3 font-medium leading-tight text-[#2D4A22] text-[14px] sm:text-[15px] break-words">{a.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#1a1a16]/60 line-clamp-2">{a.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] underline decoration-[#2D4A22]/20 underline-offset-4">{p.readMore} <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
