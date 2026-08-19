"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { Article } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE } from "../_components";
const QuillEditor = dynamic(() => import("@/components/ui/quill-editor"), { ssr: false });

export default function ArticlesPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<Article>>({});
  const [q, setQ] = useState("");
  const [localeTab, setLocaleTab] = useState<"id" | "en" | "zh">("en");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.articles as Article[];
    return (s.articles as Article[]).filter((x) => `${x.title} ${x.slug} ${x.category}`.toLowerCase().includes(n));
  }, [s.articles, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({}); setEditIdx(null); setFormOpen(true); };
  const openEdit = (i: number) => { setF(s.articles[i]); setEditIdx(i); setFormOpen(true); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); };
  const save = () => {
    if (!f.title || !f.slug) return;
    const item: Article = { slug: String(f.slug), title: String(f.title), excerpt: String(f.excerpt ?? ""), content: String(f.contentEn ?? f.content ?? ""), contentId: String(f.contentId ?? ""), contentEn: String(f.contentEn ?? f.content ?? ""), contentZh: String(f.contentZh ?? ""), date: String(f.date ?? new Date().toISOString().slice(0, 10)), category: String(f.category ?? "General"), img: String(f.img ?? "") };
    if (editIdx !== null) s.setArticles((prev: Article[]) => prev.map((x, i) => i === editIdx ? item : x)); else s.setArticles((prev: Article[]) => [...prev, item]);
    closeForm();
  };
  if (!gate) return <div className="min-h-screen bg-[#FFFCF2] grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[1]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[1]}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.articles.length}</span></div>
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[1]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="slug"><Input value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="tempering-guide" /></Field>
            <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="How to temper couverture" /></Field>
            <Field label="category"><Input value={f.category ?? ""} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Guide" /></Field>
            <Field label="date"><Input type="date" value={f.date ?? ""} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" /></Field></div>
            <div className="sm:col-span-2"><Field label="excerpt"><TextArea value={f.excerpt ?? ""} onChange={(e) => setF({ ...f, excerpt: e.target.value })} rows={2} placeholder="Short summary" /></Field></div>
            <div className="sm:col-span-2 grid gap-2">
              <div className="flex items-center justify-between"><span className="text-[10px] tracking-[0.14em] text-[#8B6F47]">Content — WYSIWYG</span><span className="text-[11px] text-[#8B6F47]">Quill</span></div>
              <div className="flex gap-1 rounded-full border border-[#2D4A22]/10 bg-[#FFFCF2] p-1 w-fit">
                {(["id", "en", "zh"] as const).map((loc) => (
                  <button key={loc} type="button" onClick={() => setLocaleTab(loc)} className={`rounded-full px-3 py-1.5 text-[11px] font-medium ${localeTab === loc ? "bg-[#2D4A22] text-white" : "text-[#8B6F47]"}`}>{loc === "id" ? "ID" : loc === "en" ? "EN" : "中文"}</button>
                ))}
              </div>
              {localeTab === "id" && <QuillEditor value={f.contentId ?? ""} onChange={(v) => setF((prev) => ({ ...prev, contentId: v }))} placeholder="Tulis konten (ID)…" />}
              {localeTab === "en" && <QuillEditor value={f.contentEn ?? (f.content ?? "")} onChange={(v) => setF((prev) => ({ ...prev, contentEn: v, content: v }))} placeholder="Write content (EN)…" />}
              {localeTab === "zh" && <QuillEditor value={f.contentZh ?? ""} onChange={(v) => setF((prev) => ({ ...prev, contentZh: v }))} placeholder="撰写内容（中文）…" />}
            </div>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.title || !f.slug} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{a.save}</button><button onClick={closeForm} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.articles.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[1]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[720px] text-[12px]">
                <thead className="bg-[#FFFCF2] text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Image</th><th className="px-3 py-3 text-left font-medium">Title</th><th className="px-3 py-3 text-left font-medium">Slug</th><th className="px-3 py-3 text-left font-medium">Category</th><th className="px-3 py-3 text-left font-medium">Date</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((ar: Article) => {
                    const realIdx = (s.articles as Article[]).indexOf(ar);
                    const isVideo = ar.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(ar.img ?? "");
                    return (
                      <tr key={ar.slug + realIdx} className="hover:bg-[#FFFCF2]/60">
                        <td className="px-3 py-2">{isVideo ? <video src={ar.img} className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0]" muted /> : <img src={ar.img} alt="" className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0]" />}</td>
                        <td className="px-3 py-2 font-medium text-[#2D4A22] line-clamp-1">{ar.title}</td>
                        <td className="px-3 py-2 text-[#8B6F47]">{ar.slug}</td>
                        <td className="px-3 py-2">{ar.category}</td>
                        <td className="px-3 py-2 text-[#8B6F47]">{ar.date}</td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(realIdx)} className="rounded-full border bg-white px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => s.setArticles((prev: Article[]) => prev.filter((_: Article, idx: number) => idx !== realIdx))} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
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
