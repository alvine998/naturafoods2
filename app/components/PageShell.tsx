"use client";
import Link from "next/link";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteNav />
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
export function PageHeader({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      {eyebrow && <p className="text-[10px] tracking-[0.2em] sm:text-[11px] sm:tracking-[0.24em] text-[#8B6F47]">{eyebrow}</p>}
      <h1 className="mt-2 sm:mt-3 font-[var(--font-display)] text-[26px] leading-[0.95] sm:text-[32px] md:text-[40px] lg:text-[44px] font-light text-[#2D4A22] break-words">{title}</h1>
      {desc && <p className="mt-3 sm:mt-4 max-w-[60ch] text-[13px] leading-6 sm:text-[14px] text-[#1a1a16]/60">{desc}</p>}
    </div>
  );
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] tracking-[0.08em] text-[#8B6F47]">
        <li><Link href="/" className="hover:text-[#2D4A22] hover:underline">Home</Link><span className="ml-1.5 text-[#C4B5A0]">/</span></li>
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1.5">
            {it.href ? <Link href={it.href} className="hover:text-[#2D4A22] hover:underline">{it.label}</Link> : <span className="text-[#2D4A22]">{it.label}</span>}
            {i < items.length - 1 && <span className="text-[#C4B5A0]">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
