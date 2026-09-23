"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PageShell, { Breadcrumbs } from "../../components/PageShell";
import { ArticleJsonLd, BreadcrumbJsonLd } from "../../components/JsonLd";
import { SITE_URL } from "../../lib/seo";
import { useLang } from "../../i18n";
import { SEED_ARTICLES } from "../../lib/data";
import type { Article } from "../../lib/data";
import { getArticleContent, fetchArticleBySlug } from "../../lib/store";

// Mirrors the loaded detail layout (hero → chips → title → excerpt → body)
// so the 13MB payloads don't show a bare "…" for ~15s.
function ArticleDetailSkeleton({ backLabel }: { backLabel: string }) {
  return (
    <PageShell>
      <div className="h-3 w-40 animate-pulse rounded-full bg-[#F5EFE0]" />
      <span className="mt-4 inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22]/40"><ArrowLeft className="h-3 w-3" /> {backLabel}</span>
      <div className="mt-4 sm:mt-6 overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white border border-[#2D4A22]/10 animate-pulse">
        <div className="h-[220px] sm:h-[320px] md:h-[360px] w-full bg-[#F5EFE0]" />
        <div className="p-4 sm:p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 rounded-full bg-[#F5EFE0]" />
            <div className="h-3 w-20 rounded-full bg-[#F5EFE0]" />
          </div>
          <div className="space-y-2.5">
            <div className="h-7 sm:h-9 md:h-11 w-11/12 rounded bg-[#F5EFE0]" />
            <div className="h-7 sm:h-9 md:h-11 w-2/3 rounded bg-[#F5EFE0]" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 w-full rounded bg-[#F5EFE0]" />
            <div className="h-3 w-5/6 rounded bg-[#F5EFE0]" />
            <div className="h-3 w-4/6 rounded bg-[#F5EFE0]" />
          </div>
          <div className="space-y-2.5 pt-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-3 rounded bg-[#F5EFE0] ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useLang();
  const [article, setArticle] = useState<Article | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Detail endpoint is the only one that returns content fields —
      // GET /articles (list) excludes contentID/contentEN/contentZN.
      let found = await fetchArticleBySlug(slug);
      if (!found) {
        // offline / 404 fallback: local cache (may lack content) then seed
        try {
          const v = localStorage.getItem("nf_articles");
          if (v) {
            const parsed = JSON.parse(v) as Article[];
            found = parsed
              .map((a) => ({ ...a, contentId: a.contentId ?? a.content, contentEn: a.contentEn ?? a.content, contentZh: a.contentZh ?? a.content }))
              .find((a) => a.slug === slug) ?? null;
          }
        } catch {}
        if (!found) found = SEED_ARTICLES.find((a) => a.slug === slug) ?? null;
      }
      if (cancelled) return;
      setArticle(found);
      setDone(true);
    })();
    return () => { cancelled = true; };
  }, [slug]);
  if (!done) return <ArticleDetailSkeleton backLabel={t.articleDetail.back} />;
  if (!article) return <PageShell><p className="py-12 text-center text-[#8B6F47]">{t.articleDetail.notFound}</p><Link href="/articles" className="mx-auto mt-4 block w-fit rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] tracking-[0.14em] text-white">{t.articleDetail.back}</Link></PageShell>;
  const img = article.img?.trim() ? article.img : null;
  const isVideo = !!img && (img.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(img));
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Articles", href: "/articles" }, { label: article.title }]} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: SITE_URL }, { name: "Articles", url: `${SITE_URL}/articles` }, { name: article.title, url: `${SITE_URL}/articles/${article.slug}` }]} />
      <ArticleJsonLd title={article.title} description={article.excerpt} datePublished={article.date} image={img ?? undefined} url={`${SITE_URL}/articles/${article.slug}`} category={article.category} />
      <Link href="/articles" className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-[#2D4A22] hover:underline"><ArrowLeft className="h-3 w-3" /> {t.articleDetail.back}</Link>
      <div className="mt-4 sm:mt-6 overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white border border-[#2D4A22]/10">
        {img ? (
          isVideo ? <video src={img} controls className="h-[220px] sm:h-[320px] md:h-[360px] w-full object-cover" /> : <Image src={img} alt={article.title} className="h-[220px] sm:h-[320px] md:h-[360px] w-full object-cover" width={800} height={360} />
        ) : null}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] tracking-[0.14em] text-[#8B6F47]"><span className="rounded-full border border-[#2D4A22]/10 bg-white px-3 py-1">{article.category}</span><span>{article.date}</span></div>
          <h1 className="mt-3 sm:mt-4 font-[var(--font-display)] text-[24px] sm:text-[28px] md:text-[36px] lg:text-[40px] font-light leading-none text-[#2D4A22] break-words">{article.title}</h1>
          <p className="mt-3 text-[13px] sm:text-[14px] leading-6 text-[#1a1a16]/60">{article.excerpt}</p>
          <div className="prose prose-sm mt-6 max-w-none text-[13px] sm:text-[14px] leading-7 text-[#1a1a16]/70 break-words [&_img]:max-w-full [&_img]:rounded-xl [&_a]:text-[#2D4A22] [&_a]:underline" dangerouslySetInnerHTML={{ __html: getArticleContent(article, locale) }} />
        </div>
      </div>
    </PageShell>
  );
}
