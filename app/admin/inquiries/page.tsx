"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card, Input, TableWrap, Pagination, Empty, PAGE_SIZE } from "../_components";
import { apiFetch, API_BASE, getAccessToken } from "../../lib/api";

export default function InquiriesPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.inquiries as any[];
    return (s.inquiries as any[]).filter((x: any) => `${x.name} ${x.city} ${x.interest}`.toLowerCase().includes(n));
  }, [s.inquiries, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const remove = async (realIdx: number) => {
    const inq = (s.inquiries as any[])[realIdx];
    const snap = [...s.inquiries];
    s.setInquiries((prev: any[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/inquiries/${encodeURIComponent(inq.id)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setInquiries(snap as any);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/admin/inquiries/export?format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Export failed ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url;
      el.download = "inquiries.csv";
      el.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
      setTimeout(() => setErr(null), 2500);
      // fallback: local CSV
      try {
        const rows = [["id","name","city","whatsapp","interest","date"], ...filtered.map((x: any) => [x.id, x.name, x.city, x.whatsapp, x.interest, x.date])];
        const csv = rows.map((r) => r.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const el = document.createElement("a");
        el.href = url; el.download = "inquiries-local.csv"; el.click();
        URL.revokeObjectURL(url);
      } catch {}
    } finally { setExporting(false); }
  };

  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[6]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[6]}</h1></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#2D4A22] px-3 py-1 text-[11px] text-white">{filtered.length}</span><button onClick={handleExport} disabled={exporting} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-1.5 text-[11px] text-[#2D4A22] hover:bg-white disabled:opacity-60">{exporting ? "Exporting…" : "Export CSV"}</button></div></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      <p className="mt-2 text-[10px] text-[#8B6F47]">Admin: <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">GET /admin/inquiries?q=&interest=&city=&page=&limit=&sort=createdAt:desc</code> · <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">DELETE /admin/inquiries/:id</code> · <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">GET /admin/inquiries/export?format=csv</code> · fallback localStorage</p>
      {s.inquiries.length === 0 ? <Card className="mt-4 p-8 text-center text-[13px] text-[#8B6F47]">{a.noData}</Card> : (
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inquiries…" className="rounded-full" /><span className="hidden sm:inline-flex shrink-0 items-center rounded-full border bg-white px-3 py-1.5 text-[11px] text-[#8B6F47]">{filtered.length}/{s.inquiries.length}</span></div>
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[640px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="text-left px-4 py-3 font-medium">Name</th><th className="text-left px-4 py-3 font-medium">City</th><th className="text-left px-4 py-3 font-medium">WhatsApp</th><th className="text-left px-4 py-3 font-medium">Interest</th><th className="text-left px-4 py-3 font-medium">Date</th><th className="px-4 py-3"></th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((inq: any, i: number) => {
                    const realIdx = (s.inquiries as any[]).indexOf(inq);
                    return (
                      <tr key={inq.id + i} className="hover:bg-white/60"><td className="px-4 py-3 font-medium text-[#2D4A22]">{inq.name}</td><td className="px-4 py-3 text-[#1a1a16]/70">{inq.city}</td><td className="px-4 py-3">{inq.whatsapp}</td><td className="px-4 py-3"><span className="rounded-full bg-[#2D4A22]/10 px-2.5 py-1 text-[11px] text-[#2D4A22]">{inq.interest}</span></td><td className="px-4 py-3 text-[#8B6F47]">{new Date(inq.date).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><button onClick={() => remove(realIdx)} className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></td></tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </TableWrap>
          )}
        </div>
      )}
    </AdminShell>
  );
}
