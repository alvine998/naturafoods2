import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Contact Us", description: "Tell us your outlet, volume and city — price list & samples within 24h. Jakarta · Surabaya · Bali. hello@naturafoods.id", path: "/contact" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
