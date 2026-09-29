import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "./i18n";
import { baseMetadata } from "./lib/seo";
import { OrgJsonLd } from "./components/JsonLd";
import ScrollToTopOnNav from "./components/ScrollToTopOnNav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });
// Local Poppins from public/fonts/Poppins (self-hosted, no Google download)
const poppins = localFont({
  src: [
    { path: "../public/fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = baseMetadata();
export const viewport: Viewport = { themeColor: "#2D4A22", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-[#1a1a16]">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-8VQMTMC3D1" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-8VQMTMC3D1');`}
        </Script>
        <OrgJsonLd />
        <ScrollToTopOnNav />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
