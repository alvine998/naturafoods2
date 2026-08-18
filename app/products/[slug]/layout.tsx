import type { Metadata } from "next";
import { SEED_PRODUCTS } from "../../lib/data";
import { pageMetadata, SITE_URL } from "../../lib/seo";
export function generateStaticParams() { return SEED_PRODUCTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = SEED_PRODUCTS.find((x) => x.slug === slug);
  if (!p) return pageMetadata({ title: "Product", description: "Product not found.", path: `/products/${slug}` });
  return pageMetadata({ title: p.title, description: p.desc, path: `/products/${p.slug}`, image: p.img || `${SITE_URL}/og.jpg` });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
