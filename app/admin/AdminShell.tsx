"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Package, Newspaper, GraduationCap, Lightbulb, Briefcase, Mail, Menu, X, ArrowLeft } from "lucide-react";
import { logout } from "../lib/auth";
import { useLang } from "../i18n";

type Props = {
  active: number;
  onTab: (i: number) => void;
  counts: number[];
  labels: string[];
  children: React.ReactNode;
};

const ICONS = [Package, Newspaper, GraduationCap, Lightbulb, Briefcase, Mail] as const;

export default function AdminShell({ active, onTab, counts, labels, children }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = labels.map((l, i) => ({ label: l, Icon: ICONS[i] ?? Package, count: counts[i] ?? 0, idx: i }));

  const Sidebar = ({ compact }: { compact?: boolean }) => (
    <nav className="grid gap-1">
      {nav.map((n) => (
        <button
          key={n.idx}
          onClick={() => { onTab(n.idx); setMobileOpen(false); }}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[12px] tracking-[0.02em] transition ${active === n.idx ? "bg-[#2D4A22] text-white shadow-[0_4px_16px_rgba(45,74,34,0.25)]" : "text-[#2D4A22]/70 hover:bg-[#2D4A22]/[0.06] hover:text-[#2D4A22]"}`}
        >
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${active === n.idx ? "bg-white/15 text-white" : "bg-[#FFFCF2] border border-[#2D4A22]/10"}`}><n.Icon className="h-3.5 w-3.5" /></span>
          {!compact && <span className="flex-1 truncate font-medium">{n.label}</span>}
          {!compact && <span className={`rounded-full px-2 py-0.5 text-[10px] ${active === n.idx ? "bg-white/15 text-white" : "bg-[#2D4A22]/[0.06] text-[#2D4A22]/60"}`}>{n.count}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FFFCF2]">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-[#2D4A22]/10 bg-[#FFFCF2]/85 backdrop-blur-xl">
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
            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#FFFCF2]"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
            <button onClick={() => { logout(); router.push("/admin/login"); }} className="rounded-full bg-[#2D4A22] px-4 sm:px-5 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317]">{a.logout}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-0 lg:gap-6 px-0 sm:px-6 py-0 sm:py-6">
        {/* desktop sidebar */}
        <aside className="hidden lg:flex w-[260px] shrink-0 flex-col gap-4">
          <div className="rounded-2xl bg-white border border-[#2D4A22]/10 p-4 shadow-[0_2px_12px_rgba(26,26,22,0.04)]">
            <p className="text-[10px] tracking-[0.16em] text-[#8B6F47]">NAVIGATION</p>
            <div className="mt-3"><Sidebar /></div>
            <div className="mt-4 rounded-xl bg-[#FFFCF2] border border-[#2D4A22]/10 p-3">
              <p className="text-[11px] font-medium text-[#2D4A22]">{a.dashTitle}</p>
              <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">Manage products, articles & inquiries. Changes save to localStorage.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-[#2D4A22]/15 px-4 py-3 text-[11px] leading-5 text-[#8B6F47]">Tip: exports are local-only. Connect a backend to persist across devices.</div>
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-[#1a1a16]/30 backdrop-blur-sm" />
            <div className="absolute inset-y-0 left-0 w-[84%] max-w-[320px] bg-[#FFFCF2] border-r border-[#2D4A22]/10 p-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.16em] text-[#8B6F47]">MENU</span>
                <button onClick={() => setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D4A22] text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4"><Sidebar /></div>
              <Link href="/" onClick={() => setMobileOpen(false)} className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white py-2.5 text-[11px] tracking-[0.12em] text-[#2D4A22]"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
            </div>
          </div>
        )}

        {/* main */}
        <div className="min-w-0 flex-1 px-4 sm:px-0 py-4 sm:py-0">{children}</div>
      </div>
    </div>
  );
}
