import type { Metadata } from "next";

// ponytail: set NEXT_PUBLIC_SITE_URL in env for correct canonical/og urls in production
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://naturafoods.id").replace(/\/$/, "");
export const SITE_NAME = "NaturaFoods";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`; // add public/og.jpg (1200x630)

export function canonical(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function baseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "NaturaFoods — Choco & Matcha Distribution · Jakarta", template: `%s · ${SITE_NAME}` },
    description: "Jakarta-based distributor supplying choco & matcha to 400+ cafés, hotels, bakeries and retailers. Direct sourcing from Belgium, Ecuador & Uji — cold-chain logistics & barista training.",
    applicationName: SITE_NAME,
    referrer: "origin-when-cross-origin",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_ID",
      alternateLocale: ["id_ID", "zh_CN"],
      siteName: SITE_NAME,
      title: "NaturaFoods — Choco & Matcha Distribution",
      description: "Premium choco & matcha distributor for HORECA — 400+ partners, cold-chain Jakarta.",
      url: SITE_URL,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title: "NaturaFoods — Choco & Matcha Distribution", description: "Premium choco & matcha for cafés, hotels & kitchens.", images: [DEFAULT_OG_IMAGE] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    icons: { icon: "/logo.png", apple: "/logo.png" },
    ...overrides,
  };
}

export function pageMetadata(opts: { title: string; description: string; path: string; image?: string; noIndex?: boolean }): Metadata {
  const url = canonical(opts.path);
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: { title: opts.title, description: opts.description, url, images: [{ url: image, width: 1200, height: 630, alt: opts.title }] },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
