import { SITE_URL, SITE_NAME } from "../lib/seo";

export function OrgJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Premium choco & matcha distributor for cafés, hotels and kitchens — Jakarta, Surabaya, Bali.",
    address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" },
    contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "hello@naturafoods.id", telephone: "+62-812-3456-7890", availableLanguage: ["en", "id", "zh"] }],
    sameAs: ["https://instagram.com/naturafoods"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ArticleJsonLd(props: { title: string; description: string; datePublished: string; image: string; url: string; category?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    datePublished: props.datePublished,
    dateModified: props.datePublished,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: props.url,
    image: props.image,
    articleSection: props.category,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
