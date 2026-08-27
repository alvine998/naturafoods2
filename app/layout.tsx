import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./i18n";
import { baseMetadata } from "./lib/seo";
import { OrgJsonLd } from "./components/JsonLd";
import ChatAssistant from "./components/ChatAssistant";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

export const metadata: Metadata = baseMetadata();
export const viewport: Viewport = { themeColor: "#2D4A22", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-[#1a1a16]">
        <OrgJsonLd />
        <LanguageProvider>{children}<ChatAssistant /></LanguageProvider>
      </body>
    </html>
  );
}
