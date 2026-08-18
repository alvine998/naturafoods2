import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Dashboard", description: "NaturaFoods CMS dashboard.", path: "/admin/dashboard", noIndex: true });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
