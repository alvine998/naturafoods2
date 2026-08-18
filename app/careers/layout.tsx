import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Careers", description: "Join NaturaFoods — build the supply chain for choco & matcha across Indonesia. Open roles via Glints.", path: "/careers" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
