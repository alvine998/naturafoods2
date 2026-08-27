"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { Innovation } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE } from "../_components";

export default function InnovationPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<Innovation>>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.innovation as Innovation[];
    return (s.innovation as Innovation[]).filter((x) => `${x.title} ${x.tag}`.toLowerCase().includes(n));
  }, [s.innovation, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({}); setEditIdx(null); setFormOpen(true); };
  const openEdit = (i: number) => { setF(s.innovation[i]); setEditIdx(i); setFormOpen(true); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); };
  const save = () => {
    if (!f.title) return;
    const item: Innovation = { id: String(f.id ?? Date.now().toString()), title: String(f.title), desc: String(f.desc ?? ""), tag: String(f.tag ?? ""), img: String(f.img ?? ""), link: String(f.link ?? ""), cta: String(f.cta ?? ""), eyebrow: String(f.eyebrow ?? "") };
    if (editIdx !== null) s.setInnovation((prev: Innovation[]) => prev.map((x, i) => i === editIdx ? item : x)); else s.setInnovation((prev: Innovation[]) => [...prev, item]);
    closeForm();
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[3]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[3]}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.innovation.length}</span></div>
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[3]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="id"><Input value={f.id ?? ""} onChange={(e) => setF({ ...f, id: e.target.value })} placeholder="innov-001" /></Field>
            <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Nusantara Single-Origin" /></Field>
            <div className="sm:col-span-2"><Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={2} /></Field></div>
            <Field label="tag"><Input value={f.tag ?? ""} onChange={(e) => setF({ ...f, tag: e.target.value })} placeholder="R&D Pilot" /></Field>
            <Field label="eyebrow"><Input value={f.eyebrow ?? ""} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} placeholder="INNOVATION · R&D" /></Field>
            <div className="sm:col-span-2"><Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" /></Field></div>
            <Field label="link"><Input value={f.link ?? ""} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></Field>
            <Field label="cta"><Input value={f.cta ?? ""} onChange={(e) => setF({ ...f, cta: e.target.value })} placeholder="Watch film" /></Field>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.title} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{a.save}</button><button onClick={closeForm} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.innovation.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[3]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[640px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Title</th><th className="px-3 py-3 text-left font-medium">Tag</th><th className="px-3 py-3 text-left font-medium">Eyebrow</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((it: Innovation) => {
                    const realIdx = (s.innovation as Innovation[]).indexOf(it);
                    return (
                      <tr key={it.id + realIdx} className="hover:bg-white/60">
                        <td className="px-3 py-2 font-medium text-[#2D4A22]">{it.title}</td>
                        <td className="px-3 py-2"><span className="rounded-full bg-[#2D4A22]/10 px-2 py-0.5 text-[11px]">{it.tag}</span></td>
                        <td className="px-3 py-2 text-[#8B6F47]">{it.eyebrow}</td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(realIdx)} className="rounded-full border px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => s.setInnovation((prev: Innovation[]) => prev.filter((_: Innovation, idx: number) => idx !== realIdx))} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
                      </tr>
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
