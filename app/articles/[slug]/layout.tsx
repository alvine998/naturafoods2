import type { Metadata } from "next";
import { API_BASE } from "../../lib/api";
import { SEED_ARTICLES } from "../../lib/data";
import { DEFAULT_OG_IMAGE, pageMetadata, SITE_URL } from "../../lib/seo";

export function generateStaticParams() {
  return SEED_ARTICLES.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let article = SEED_ARTICLES.find((item) => item.slug === slug) ?? null;

  try {
    const response = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (response.ok) {
      const result = await response.json() as { success?: boolean; data?: Record<string, unknown> };
      const data = result.data;
      if (result.success && data && data.isPublished !== false && data.is_published !== false) {
        article = {
          slug: String(data.slug ?? slug),
          title: String(data.title ?? "Article"),
          excerpt: String(data.excerpt ?? ""),
          content: "",
          date: String(data.date ?? data.published_date ?? ""),
          category: String(data.category ?? ""),
          img: String(data.img ?? data.image ?? data.thumbnail ?? ""),
        };
      }
    }
  } catch {
    // Use seed metadata when the article API is unavailable.
  }

  if (!article) return pageMetadata({ title: "Article", description: "Article not found.", path: `/articles/${slug}` });
  const img = article.img.trim();
  let image = DEFAULT_OG_IMAGE;
  try {
    const candidate = new URL(img, SITE_URL);
    if ((candidate.protocol === "http:" || candidate.protocol === "https:") && !/\.(mp4|webm|mov)(\?|$)/i.test(candidate.href)) {
      image = candidate.href;
    }
  } catch {
    // Fall back to the site logo when the article image isn't a usable URL.
  }
  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    image,
  });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
