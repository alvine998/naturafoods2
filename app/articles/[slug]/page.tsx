"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell, { Breadcrumbs } from "../../components/PageShell";
import { ArticleJsonLd, BreadcrumbJsonLd } from "../../components/JsonLd";
import { SITE_URL } from "../../lib/seo";
import { useLang } from "../../i18n";
import { SEED_ARTICLES } from "../../lib/data";
import type { Article } from "../../lib/data";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLang();
  const [article, setArticle] = useState<Article | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let list: Article[] = SEED_ARTICLES;
    try { const v = localStorage.getItem("nf_articles"); if (v) list = JSON.parse(v); } catch {}
    setArticle(list.find((a) => a.slug === slug) ?? null);
    setDone(true);
  }, [slug]);
  if (!done) return <PageShell><p className="py-12 text-center text-[#8B6F47]">…</p></PageShell>;
  if (!article) return <PageShell><p className="py-12 text-center text-[#8B6F47]">{t.articleDetail.notFound}</p><Link href="/articles" className="mx-auto mt-4 block w-fit rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] tracking-[0.14em] text-white">{t.articleDetail.back}</Link></PageShell>;
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Articles", href: "/articles" }, { label: article.title }]} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: SITE_URL }, { name: "Articles", url: `${SITE_URL}/articles` }, { name: article.title, url: `${SITE_URL}/articles/${article.slug}` }]} />
      <ArticleJsonLd title={article.title} description={article.excerpt} datePublished={article.date} image={article.img} url={`${SITE_URL}/articles/${article.slug}`} category={article.category} />
      <Link href="/articles" className="inline-flex text-[11px] tracking-[0.14em] text-[#2D4A22] hover:underline">← {t.articleDetail.back}</Link>
      <div className="mt-4 sm:mt-6 overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white border border-[#2D4A22]/10">
        <img src={article.img} alt={article.title} className="h-[220px] sm:h-[320px] md:h-[360px] w-full object-cover" />
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] tracking-[0.14em] text-[#8B6F47]"><span className="rounded-full border border-[#2D4A22]/10 bg-[#FFFCF2] px-3 py-1">{article.category}</span><span>{article.date}</span></div>
          <h1 className="mt-3 sm:mt-4 font-[var(--font-display)] text-[24px] sm:text-[28px] md:text-[36px] lg:text-[40px] font-light leading-none text-[#2D4A22] break-words">{article.title}</h1>
          <p className="mt-3 text-[13px] sm:text-[14px] leading-6 text-[#1a1a16]/60">{article.excerpt}</p>
          <div className="prose prose-sm mt-6 max-w-none text-[13px] sm:text-[14px] leading-7 text-[#1a1a16]/70 break-words [&_img]:max-w-full [&_img]:rounded-xl" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </PageShell>
  );
}
