import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./i18n";
import { baseMetadata } from "./lib/seo";
import { OrgJsonLd } from "./components/JsonLd";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

export const metadata: Metadata = baseMetadata();
export const viewport: Viewport = { themeColor: "#2D4A22", width: "device-width", initialScale: 1 };

function WhatsAppButton() {
  return (
    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2">
      <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7" aria-hidden>
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.59 2 2.15 6.43 2.15 11.88c0 1.74.46 3.44 1.32 4.94L2 22l5.33-1.4a9.87 9.87 0 0 0 4.71 1.2h.01c5.45 0 9.88-4.43 9.88-9.88 0-2.64-1.03-5.12-2.88-6.97Zm-7.01 8.65c-.37-.18-2.18-1.08-2.52-1.2-.34-.12-.58-.19-.83.18-.24.37-.96 1.2-1.17 1.45-.22.25-.43.28-.8.09-.37-.18-1.55-.57-2.96-1.82-.94-.84-1.58-1.87-1.76-2.18-.19-.32-.02-.49.14-.65.14-.14.37-.37.55-.55.18-.18.24-.31.37-.62.12-.31.06-.58-.03-.8-.09-.22-.83-2-1.14-2.74-.3-.71-.6-.61-.83-.62l-.71-.01c-.24 0-.64.09-.97.46-.34.37-1.28 1.25-1.28 3.05s1.31 3.54 1.49 3.78c.18.25 2.58 3.94 6.42 5.52.9.39 1.6.62 2.15.8.9.29 1.72.25 2.37.15.72-.11 2.18-.89 2.49-1.75.31-.86.31-1.6.22-1.75-.09-.15-.34-.25-.71-.43Z" />
      </svg>
    </a>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FFFCF2] text-[#1a1a16]">
        <OrgJsonLd />
        <LanguageProvider>{children}</LanguageProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
