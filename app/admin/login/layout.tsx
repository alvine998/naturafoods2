import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Admin Login", description: "NaturaFoods admin login.", path: "/admin/login", noIndex: true });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
