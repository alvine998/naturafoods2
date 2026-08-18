import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Education Center", description: "Barista, pastry and costing workshops for HORECA partners — Jakarta, Surabaya & online. Matcha essentials, choco pastry lab.", path: "/education" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
