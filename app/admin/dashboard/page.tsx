"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card } from "../_components";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  if (!gate) return <div className="min-h-screen bg-[#FFFCF2] grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0];
  const links = [
    { href: "/admin/products", label: a.tabs[0], c: counts[0], sub: "catalog" },
    { href: "/admin/articles", label: a.tabs[1], c: counts[1], sub: "published" },
    { href: "/admin/education", label: a.tabs[2], c: counts[2], sub: "classes" },
    { href: "/admin/innovation", label: a.tabs[3], c: counts[3], sub: "pilots" },
    { href: "/admin/careers", label: a.tabs[4], c: counts[4], sub: "open roles" },
    { href: "/admin/inquiries", label: a.tabs[5], c: counts[5], sub: "leads" },
    { href: "/admin/users", label: a.tabs[6], c: counts[6], sub: "users" },
  ];
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · Dashboard</p>
          <h1 className="mt-1 font-[var(--font-display)] text-[26px] font-light leading-none text-[#2D4A22] sm:text-[30px]">{a.dashTitle}</h1>
          <p className="mt-2 max-w-[60ch] text-[12px] leading-5 text-[#1a1a16]/60">Overview. Pick a section to manage.</p>
        </div>
        <button onClick={() => { if (confirm(a.resetConfirm)) s.reset(); }} className="self-start rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5 sm:self-auto">{a.reset}</button>
      </div>
      <Card className="mt-6 grid grid-cols-2 gap-3 p-3 sm:grid-cols-4 sm:p-4">
        {links.slice(0, 6).map((x) => (
          <Link key={x.href} href={x.href} className="rounded-2xl border border-[#2D4A22]/10 bg-[#FFFCF2] p-4 hover:bg-white">
            <p className="text-[10px] tracking-[0.14em] text-[#8B6F47]">{x.label.toUpperCase()}</p>
            <p className="mt-1 font-[var(--font-display)] text-[22px] font-light text-[#2D4A22]">{x.c}</p>
            <p className="text-[11px] text-[#8B6F47]">{x.sub}</p>
          </Link>
        ))}
      </Card>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((x) => (
          <Link key={x.href} href={x.href} className="flex items-center justify-between rounded-2xl border border-[#2D4A22]/10 bg-white p-4 hover:border-[#2D4A22]/20">
            <span className="text-[13px] font-medium text-[#2D4A22]">{x.label}</span>
            <span className="rounded-full bg-[#2D4A22] px-2.5 py-1 text-[11px] text-white">{x.c}</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
