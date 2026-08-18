import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Articles", description: "Guides for cafés, hotels & kitchens — tempering, matcha grades, cold-chain and sourcing stories.", path: "/articles" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
