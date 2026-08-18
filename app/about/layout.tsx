import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "About Us", description: "Jakarta-based choco & matcha distributor since 2019 — direct import, cold-chain and training for 400+ HORECA partners.", path: "/about" });
export default function AboutLayout({ children }: { children: React.ReactNode }) { return children; }
