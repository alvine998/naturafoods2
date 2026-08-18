import type { Metadata } from "next";
import { SEED_ARTICLES } from "../../lib/data";
import { pageMetadata, SITE_URL } from "../../lib/seo";

export function generateStaticParams() {
  return SEED_ARTICLES.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = SEED_ARTICLES.find((x) => x.slug === slug);
  if (!a) return pageMetadata({ title: "Article", description: "Article not found.", path: `/articles/${slug}` });
  return pageMetadata({ title: a.title, description: a.excerpt, path: `/articles/${a.slug}`, image: a.img || `${SITE_URL}/og.jpg` });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
