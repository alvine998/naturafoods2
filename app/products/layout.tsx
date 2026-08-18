import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Products", description: "Couverture & matcha for professionals — wholesale MOQ 6kg. Belgian dark, milk, white and Uji ceremonial to culinary matcha.", path: "/products" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
