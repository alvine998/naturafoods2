import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Innovation Center", description: "R&D pilots — Nusantara single-origin cacao, low-sugar couverture & nitrogen-sealed retail packs.", path: "/innovation" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
