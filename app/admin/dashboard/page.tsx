"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { apiFetch } from "../../lib/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type StatsData = {
  products?: number;
  productsHighlighted?: number;
  officialPartners?: number;
  officialPartnersPublished?: number;
  articles?: number;
  education?: number;
  innovation?: number;
  jobs?: number;
  inquiries?: number;
  users?: number;
  salesContacts?: number;
  sales?: number;
  counts?: number[];
};

const BRAND_GREEN = "#2D4A22";
const BRAND_GOLD = "#8B6F47";
const BRAND_CREAM = "#F5EFE0";
const BRAND_GREEN_LIGHT = "#4A7A3A";

function gradientDefs(id: string, c1: string, c2: string) {
  return {
    chart: { id },
    fill: {
      type: "gradient",
      gradient: { shade: "light", type: "vertical", stops: [0, 100], colorStops: [{ offset: 0, color: c1, opacity: 1 }, { offset: 100, color: c2, opacity: 1 }] },
    },
  };
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: number; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#2D4A22]/8 bg-white p-5 transition-all hover:shadow-lg hover:shadow-[#2D4A22]/8 hover:-translate-y-0.5">
      <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-[0.06] transition-transform group-hover:scale-125" style={{ background: color }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase">{label}</p>
          <p className="mt-2 font-[var(--font-display)] text-[32px] font-light leading-none text-[#2D4A22]">{value}</p>
          <p className="mt-1.5 text-[11px] text-[#8B6F47]/70">{sub}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${color}14`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  useEffect(() => {
    if (!gate) return;
    let cancelled = false;
    setLoadingStats(true);
    apiFetch<StatsData>("/admin/stats")
      .then((json) => { if (!cancelled && json.success && json.data) setStats(json.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingStats(false); });
    return () => { cancelled = true; };
  }, [gate]);

  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;

  const fallbackCounts = [s.products.length, s.productCategories.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const apiCounts = stats?.counts;
  const counts = apiCounts && apiCounts.length >= 11 ? apiCounts : (stats ? [
    stats.products ?? s.products.length,
    stats.officialPartners ?? s.officialPartners.length,
    stats.articles ?? s.articles.length,
    stats.education ?? s.edu.length,
    stats.innovation ?? s.innovation.length,
    stats.jobs ?? s.jobs.length,
    stats.inquiries ?? s.inquiries.length,
    stats.users ?? 0,
    0, 0,
    stats.salesContacts ?? stats.sales ?? s.salesContacts.length,
  ] : fallbackCounts);

  const prodCount = counts[0] ?? 0;
  const partnerCount = counts[4] ?? 0;
  const articleCount = counts[5] ?? 0;
  const inquiryCount = counts[9] ?? 0;
  const eduCount = counts[6] ?? 0;
  const innovCount = counts[7] ?? 0;
  const jobCount = counts[8] ?? 0;
  const userCount = counts[10] ?? 0;
  const highlighted = stats?.productsHighlighted ?? s.products.filter((p) => p.isHighlight).length;
  const publishedPartners = stats?.officialPartnersPublished ?? s.officialPartners.filter((p) => p.isPublished).length;

  // Chart: content distribution donut
  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit", background: "transparent" },
    labels: ["Products", "Partners", "Articles", "Education", "Innovation", "Jobs"],
    colors: [BRAND_GREEN, BRAND_GOLD, "#5B8C4A", "#A67C52", "#3E6B30", "#C4A96B"],
    plotOptions: { pie: { donut: { size: "72%", labels: { show: true, name: { fontSize: "11px", color: BRAND_GOLD }, value: { fontSize: "22px", fontWeight: 300, color: BRAND_GREEN, formatter: (v) => String(Math.round(Number(v))) }, total: { show: true, label: "Total", fontSize: "11px", color: BRAND_GOLD, formatter: (w) => String(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)) } } } } },
    legend: { position: "bottom", fontSize: "11px", markers: { size: 8, shape: "circle" }, itemMargin: { horizontal: 10, vertical: 4 } },
    stroke: { width: 2, colors: ["#fff"] },
    dataLabels: { enabled: false },
    tooltip: { style: { fontSize: "12px" } },
  };
  const donutSeries = [prodCount, partnerCount, articleCount, eduCount, innovCount, jobCount];

  // Chart: bar comparison
  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: "bar", fontFamily: "inherit", background: "transparent", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 8, columnWidth: "55%", distributed: true } },
    colors: [BRAND_GREEN, BRAND_GOLD, "#5B8C4A", "#A67C52", "#3E6B30", "#C4A96B", BRAND_GREEN_LIGHT],
    xaxis: { categories: ["Products", "Partners", "Articles", "Education", "Innovation", "Jobs", "Inquiries"], labels: { style: { fontSize: "10px", colors: BRAND_GOLD } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: "10px", colors: BRAND_GOLD } } },
    grid: { borderColor: "#2D4A2210", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { style: { fontSize: "12px" } },
  };
  const barSeries = [{ name: "Count", data: [prodCount, partnerCount, articleCount, eduCount, innovCount, jobCount, inquiryCount] }];

  // Chart: highlights radial
  const highlightPct = prodCount > 0 ? Math.round((highlighted / prodCount) * 100) : 0;
  const partnerPubPct = partnerCount > 0 ? Math.round((publishedPartners / partnerCount) * 100) : 0;
  const radialOptions = (label: string, color: string): ApexCharts.ApexOptions => ({
    chart: { type: "radialBar", fontFamily: "inherit", background: "transparent", sparkline: { enabled: true } },
    plotOptions: { radialBar: { hollow: { size: "62%" }, track: { background: BRAND_CREAM, strokeWidth: "100%" }, dataLabels: { name: { fontSize: "11px", color: BRAND_GOLD, offsetY: -4 }, value: { fontSize: "20px", fontWeight: 300, color: BRAND_GREEN, formatter: (v) => `${Math.round(v)}%` } } } },
    colors: [color],
    labels: [label],
    stroke: { lineCap: "round" },
  });

  const quickLinks = [
    { href: "/admin/products", label: "Products", c: prodCount, sub: "catalog", color: BRAND_GREEN },
    { href: "/admin/official-partners", label: "Partners", c: partnerCount, sub: "official", color: BRAND_GOLD },
    { href: "/admin/articles", label: "Articles", c: articleCount, sub: "published", color: "#5B8C4A" },
    { href: "/admin/inquiries", label: "Inquiries", c: inquiryCount, sub: "leads", color: "#A67C52" },
    { href: "/admin/education", label: "Education", c: eduCount, sub: "workshops", color: "#3E6B30" },
    { href: "/admin/careers", label: "Careers", c: jobCount, sub: "open roles", color: "#C4A96B" },
  ];

  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · Dashboard</p>
          <h1 className="mt-1 font-[var(--font-display)] text-[26px] font-light leading-none text-[#2D4A22] sm:text-[30px]">{a.dashTitle}</h1>
          <p className="mt-2 max-w-[60ch] text-[12px] leading-5 text-[#1a1a16]/60">
            {stats ? "Live stats from API" : loadingStats ? "Loading stats…" : "Using local cache"}
            {stats?.productsHighlighted !== undefined && ` · ${stats.productsHighlighted} highlighted products`}
          </p>
        </div>
        <button onClick={() => { if (confirm(a.resetConfirm)) s.reset(); }} className="self-start rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5 sm:self-auto">{a.reset}</button>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={prodCount} sub={`${highlighted} highlighted`} icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>} color={BRAND_GREEN} />
        <StatCard label="Partners" value={partnerCount} sub={`${publishedPartners} published`} icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>} color={BRAND_GOLD} />
        <StatCard label="Articles" value={articleCount} sub="published" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>} color="#5B8C4A" />
        <StatCard label="Inquiries" value={inquiryCount} sub="total leads" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>} color="#A67C52" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Donut */}
        <div className="rounded-2xl border border-[#2D4A22]/8 bg-white p-5 lg:col-span-1">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase">Content Distribution</p>
          <div className="mt-2">
            <Chart options={donutOptions} series={donutSeries} type="donut" height={280} />
          </div>
        </div>

        {/* Bar */}
        <div className="rounded-2xl border border-[#2D4A22]/8 bg-white p-5 lg:col-span-2">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase">Content Overview</p>
          <div className="mt-2">
            <Chart options={barOptions} series={barSeries} type="bar" height={280} />
          </div>
        </div>
      </div>

      {/* Radial gauges + quick links */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Radial gauges */}
        <div className="rounded-2xl border border-[#2D4A22]/8 bg-white p-5">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase">Highlight Rate</p>
          <div className="mt-2 flex items-center justify-center">
            <Chart options={radialOptions("Highlighted", BRAND_GREEN)} series={[highlightPct]} type="radialBar" height={200} width={200} />
          </div>
          <p className="text-center text-[11px] text-[#8B6F47]/60">{highlighted} of {prodCount} products</p>
        </div>
        <div className="rounded-2xl border border-[#2D4A22]/8 bg-white p-5">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase">Partners Published</p>
          <div className="mt-2 flex items-center justify-center">
            <Chart options={radialOptions("Published", BRAND_GOLD)} series={[partnerPubPct]} type="radialBar" height={200} width={200} />
          </div>
          <p className="text-center text-[11px] text-[#8B6F47]/60">{publishedPartners} of {partnerCount} partners</p>
        </div>
        <div className="rounded-2xl border border-[#2D4A22]/8 bg-white p-5">
          <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase">Team</p>
          <div className="mt-2 flex flex-col items-center justify-center gap-4 pt-4">
            <div className="text-center">
              <p className="font-[var(--font-display)] text-[42px] font-light leading-none text-[#2D4A22]">{userCount}</p>
              <p className="mt-2 text-[11px] text-[#8B6F47]/60">admin users</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users" className="rounded-full bg-[#2D4A22] px-4 py-1.5 text-[10px] text-white hover:bg-[#2D4A22]/90 transition">Manage Users</Link>
              <Link href="/admin/assistant" className="rounded-full border border-[#2D4A22]/15 px-4 py-1.5 text-[10px] text-[#2D4A22] hover:bg-[#2D4A22]/5 transition">AI Config</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="mt-6">
        <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase mb-3">Quick Navigation</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((x) => (
            <Link key={x.href} href={x.href} className="group flex items-center justify-between rounded-2xl border border-[#2D4A22]/8 bg-white p-4 transition-all hover:border-[#2D4A22]/20 hover:shadow-md hover:shadow-[#2D4A22]/5 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full" style={{ background: x.color }} />
                <div>
                  <span className="text-[13px] font-medium text-[#2D4A22] group-hover:underline decoration-[#2D4A22]/20 underline-offset-4">{x.label}</span>
                  <p className="text-[10px] text-[#8B6F47]/60">{x.sub}</p>
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: `${x.color}12`, color: x.color }}>{x.c}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Full nav grid */}
      <div className="mt-6">
        <p className="text-[10px] font-medium tracking-[0.18em] text-[#8B6F47]/80 uppercase mb-3">All Sections</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[
            { href: "/admin/products", label: a.tabs[0], c: counts[0] },
            { href: "/admin/product-categories", label: a.tabs[1], c: counts[1] },
            { href: "/admin/master-brands", label: a.tabs[2], c: counts[2] },
            { href: "/admin/home-brands", label: a.tabs[3], c: counts[3] },
            { href: "/admin/official-partners", label: a.tabs[4], c: counts[4] },
            { href: "/admin/articles", label: a.tabs[5], c: counts[5] },
            { href: "/admin/education", label: a.tabs[6], c: counts[6] },
            { href: "/admin/innovation", label: a.tabs[7], c: counts[7] },
            { href: "/admin/careers", label: a.tabs[8], c: counts[8] },
            { href: "/admin/inquiries", label: a.tabs[9], c: counts[9] },
            { href: "/admin/users", label: a.tabs[10], c: counts[10] },
            { href: "/admin/assistant", label: a.tabs[11], c: counts[11] },
            { href: "/admin/content", label: (a.tabs as unknown as string[])[12] ?? "Content", c: counts[12] },
            { href: "/admin/sales", label: (a.tabs as unknown as string[])[13] ?? "Sales", c: counts[13] },
            { href: "/admin/social-media", label: (a.tabs as unknown as string[])[14] ?? "Social Media", c: counts[14] ?? 0 },
            { href: "/admin/about", label: (a.tabs as unknown as string[])[15] ?? "About", c: counts[15] ?? 0 },
            { href: "/admin/settings", label: (a.tabs as unknown as string[])[16] ?? "Settings", c: counts[16] ?? 0 },
          ].map((x) => (
            <Link key={x.href} href={x.href} className="flex items-center justify-between rounded-xl border border-[#2D4A22]/6 bg-white px-3 py-2.5 text-[12px] transition-all hover:border-[#2D4A22]/15 hover:bg-[#2D4A22]/[0.02]">
              <span className="text-[#2D4A22] truncate">{x.label}</span>
              <span className="shrink-0 rounded-full bg-[#2D4A22]/[0.06] px-2 py-0.5 text-[10px] text-[#8B6F47]">{x.c}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}