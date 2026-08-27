"use client";
import Link from "next/link";
import { useLang } from "../i18n";
export default function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="border-t border-[#2D4A22]/10 bg-white px-4 py-8 sm:px-6 sm:py-10 md:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 text-[10px] leading-5 tracking-[0.14em] sm:text-[11px] text-[#8B6F47] md:flex-row md:items-center md:justify-between md:gap-6">
        <span className="break-words" suppressHydrationWarning>© {new Date().getFullYear()} {t.footerCopy}</span>
        <span className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="/products" className="hover:text-[#2D4A22]">{t.footerLinks[0]}</Link>
          <a href="https://instagram.com" target="_blank" className="hover:text-[#2D4A22]">{t.footerLinks[1]}</a>
          <Link href="/careers" className="hover:text-[#2D4A22]">{t.footerLinks[2]}</Link>
          <Link href="/admin/login" className="hover:text-[#2D4A22]">ADMIN</Link>
        </span>
      </div>
    </footer>
  );
}
