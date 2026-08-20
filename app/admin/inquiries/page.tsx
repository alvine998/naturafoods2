"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card, Input, TableWrap, Pagination, Empty, PAGE_SIZE } from "../_components";

export default function InquiriesPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.inquiries as any[];
    return (s.inquiries as any[]).filter((x: any) => `${x.name} ${x.city} ${x.interest}`.toLowerCase().includes(n));
  }, [s.inquiries, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (!gate) return <div className="min-h-screen bg-[#FFFCF2] grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[5]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[5]}</h1></div><span className="rounded-full bg-[#2D4A22] px-3 py-1 text-[11px] text-white">{filtered.length}</span></div>
      {s.inquiries.length === 0 ? <Card className="mt-4 p-8 text-center text-[13px] text-[#8B6F47]">{a.noData}</Card> : (
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inquiries…" className="rounded-full" /><span className="hidden sm:inline-flex shrink-0 items-center rounded-full border bg-white px-3 py-1.5 text-[11px] text-[#8B6F47]">{filtered.length}/{s.inquiries.length}</span></div>
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[640px] text-[12px]">
                <thead className="bg-[#FFFCF2] text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="text-left px-4 py-3 font-medium">Name</th><th className="text-left px-4 py-3 font-medium">City</th><th className="text-left px-4 py-3 font-medium">WhatsApp</th><th className="text-left px-4 py-3 font-medium">Interest</th><th className="text-left px-4 py-3 font-medium">Date</th><th className="px-4 py-3"></th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((inq: any, i: number) => {
                    const realIdx = (s.inquiries as any[]).indexOf(inq);
                    return (
                      <tr key={inq.id + i} className="hover:bg-[#FFFCF2]/60"><td className="px-4 py-3 font-medium text-[#2D4A22]">{inq.name}</td><td className="px-4 py-3 text-[#1a1a16]/70">{inq.city}</td><td className="px-4 py-3">{inq.whatsapp}</td><td className="px-4 py-3"><span className="rounded-full bg-[#2D4A22]/10 px-2.5 py-1 text-[11px] text-[#2D4A22]">{inq.interest}</span></td><td className="px-4 py-3 text-[#8B6F47]">{new Date(inq.date).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><button onClick={() => s.setInquiries((prev: any[]) => prev.filter((_: any, idx: number) => idx !== realIdx))} className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></td></tr>
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
