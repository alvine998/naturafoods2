"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, Newspaper, GraduationCap, Lightbulb, Briefcase, Mail, Users, Bot, Type, Menu, X, ArrowLeft } from "lucide-react";
import { logout } from "../lib/auth";
import { useLang } from "../i18n";

type Props = {
  counts: number[];
  labels: string[];
  children: React.ReactNode;
};

const ROUTES = [
  "/admin/dashboard",
  "/admin/products",
  "/admin/articles",
  "/admin/education",
  "/admin/innovation",
  "/admin/careers",
  "/admin/inquiries",
  "/admin/users",
  "/admin/assistant",
  "/admin/content",
] as const;

const ICONS = [LayoutDashboard, Package, Newspaper, GraduationCap, Lightbulb, Briefcase, Mail, Users, Bot, Type] as const;

export default function AdminShell({ counts, labels, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLang();
  const a = t.admin;
  const [mobileOpen, setMobileOpen] = useState(false);

  // first item is Dashboard, rest map to labels
  const nav = [
    { label: "Dashboard", href: ROUTES[0], Icon: ICONS[0], count: undefined as number | undefined, active: pathname === ROUTES[0] },
    ...labels.map((l, i) => {
      const href = ROUTES[i + 1];
      return { label: l, href, Icon: ICONS[i + 1] ?? Package, count: counts[i] ?? 0, active: pathname === href || pathname.startsWith(href + "/") };
    }),
  ];

  const Sidebar = () => (
    <nav className="grid gap-1">
      {nav.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[12px] tracking-[0.02em] transition ${n.active ? "bg-[#2D4A22] text-white shadow-[0_4px_16px_rgba(45,74,34,0.25)]" : "text-[#2D4A22]/70 hover:bg-[#2D4A22]/[0.06] hover:text-[#2D4A22]"}`}
        >
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${n.active ? "bg-white/15 text-white" : "bg-white border border-[#2D4A22]/10"}`}><n.Icon className="h-3.5 w-3.5" /></span>
          <span className="flex-1 truncate font-medium">{n.label}</span>
          {typeof n.count === "number" && <span className={`rounded-full px-2 py-0.5 text-[10px] ${n.active ? "bg-white/15 text-white" : "bg-[#2D4A22]/[0.06] text-[#2D4A22]/60"}`}>{n.count}</span>}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-white">
      <header className="shrink-0 z-30 border-b border-[#2D4A22]/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[56px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2D4A22]/15 bg-white text-[#2D4A22] lg:hidden"><Menu className="h-4 w-4" /></button>
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NaturaFoods" className="h-7 w-auto" />
              <span className="hidden sm:inline text-[11px] tracking-[0.16em] text-[#2D4A22]/70">CMS</span>
            </Link>
            <span className="hidden sm:inline h-4 w-px bg-[#2D4A22]/15" />
            <span className="hidden sm:inline text-[11px] tracking-[0.14em] text-[#8B6F47]">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-white"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
            <button onClick={() => { logout(); router.push("/admin/login"); }} className="rounded-full bg-[#2D4A22] px-4 sm:px-5 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317]">{a.logout}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0 gap-0 overflow-hidden px-0 sm:px-6 lg:gap-6">
        <aside className="hidden w-[260px] shrink-0 flex-col gap-4 overflow-y-auto overscroll-contain py-6 lg:flex">
          <div className="rounded-2xl bg-white border border-[#2D4A22]/10 p-4 shadow-[0_2px_12px_rgba(26,26,22,0.04)]">
            <p className="text-[10px] tracking-[0.16em] text-[#8B6F47]">NAVIGATION</p>
            <div className="mt-3"><Sidebar /></div>
            <div className="mt-4 rounded-xl bg-white border border-[#2D4A22]/10 p-3">
              <p className="text-[11px] font-medium text-[#2D4A22]">{a.dashTitle}</p>
              <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">Manage products, articles & inquiries. Changes save to localStorage.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-[#2D4A22]/15 px-4 py-3 text-[11px] leading-5 text-[#8B6F47]">Tip: exports are local-only. Connect a backend to persist across devices.</div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-[#1a1a16]/30 backdrop-blur-sm" />
            <div className="absolute inset-y-0 left-0 w-[84%] max-w-[320px] bg-white border-r border-[#2D4A22]/10 p-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.16em] text-[#8B6F47]">MENU</span>
                <button onClick={() => setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D4A22] text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4"><Sidebar /></div>
              <Link href="/" onClick={() => setMobileOpen(false)} className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white py-2.5 text-[11px] tracking-[0.12em] text-[#2D4A22]"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-0 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
