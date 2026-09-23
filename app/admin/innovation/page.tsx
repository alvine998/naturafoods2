"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { Innovation } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete, SortIndexField, toSortIndex, sortBySortIndex, renumberByMove, persistSortIndexDiff, patchSortIndex, SortIndexCell, useDragSort } from "../_components";
import { apiFetch } from "../../lib/api";

function slugify(input: string): string {
  return (input ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/g, "");
}

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
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.productCategories.length, s.masterBrands.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const sortedAll = useMemo(() => sortBySortIndex(s.innovation as Innovation[]), [s.innovation]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sortedAll;
    return sortedAll.filter((x) => `${x.title} ${x.tag}`.toLowerCase().includes(n));
  }, [sortedAll, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltering = q.trim() !== "";
  const pathFor = (id: string) => `/admin/innovations/${encodeURIComponent(id)}`;
  const commitSort = (item: Innovation, sortIndex: number) => {
    s.setInnovation((prev: Innovation[]) => prev.map((x) => (x.id === item.id ? { ...x, sortIndex } : x)));
    void patchSortIndex(pathFor(item.id), sortIndex);
  };
  const reorder = (from: number, to: number) => {
    if (isFiltering) return;
    const next = renumberByMove(sortedAll, from, to);
    s.setInnovation(next);
    void persistSortIndexDiff(sortedAll, next, (x) => pathFor(x.id));
  };
  const moveItem = (item: Innovation, dir: -1 | 1) => {
    const from = sortedAll.findIndex((x) => x.id === item.id);
    if (from < 0) return;
    reorder(from, from + dir);
  };
  const { rowProps, rowClass } = useDragSort({ disabled: isFiltering, onReorder: reorder });
  const openAdd = () => { setF({}); setEditIdx(null); setFormOpen(true); setErr(null); setSlugTouched(false); };
  const openEdit = (i: number) => { setF(s.innovation[i]); setEditIdx(i); setFormOpen(true); setErr(null); setSlugTouched(true); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); setSlugTouched(false); };
  const save = async () => {
    if (!f.title) return;
    const item: Innovation = { id: String(f.id ?? Date.now().toString()), title: String(f.title), desc: String(f.desc ?? ""), tag: String(f.tag ?? ""), img: String(f.img ?? ""), link: String(f.link ?? ""), sortIndex: toSortIndex(f.sortIndex) };
    setSaving(true); setErr(null);
    const isEdit = editIdx !== null;
    const originalId = isEdit ? s.innovation[editIdx!]?.id : null;
    try {
      if (isEdit) {
        await apiFetch(`/admin/innovations/${encodeURIComponent(originalId!)}`, { method: "PUT", body: JSON.stringify(item) });
        s.setInnovation((prev: Innovation[]) => prev.map((x, i) => i === editIdx ? item : x));
      } else {
        await apiFetch("/admin/innovations", { method: "POST", body: JSON.stringify(item) });
        s.setInnovation((prev: Innovation[]) => [...prev, item]);
      }
      closeForm();
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      const msg = e instanceof Error ? e.message : "Save failed";
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        // offline dev fallback — keep local only
        if (isEdit) s.setInnovation((prev: Innovation[]) => prev.map((x, i) => i === editIdx ? item : x));
        else s.setInnovation((prev: Innovation[]) => [...prev, item]);
        closeForm();
      } else {
        if (code === "CONFLICT") setErr("ID already exists (409 CONFLICT)");
        else setErr(msg);
      }
    } finally { setSaving(false); }
  };
  const remove = async (realIdx: number) => {
    if (!confirmAdminDelete("this innovation item")) return;
    const item = (s.innovation as Innovation[])[realIdx];
    const snap = [...s.innovation];
    s.setInnovation((prev: Innovation[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/innovations/${encodeURIComponent(item.id)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setInnovation(snap as Innovation[]);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[7]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[7]}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.innovation.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[6]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="id"><Input value={f.id ?? ""} onChange={(e) => { setSlugTouched(true); setF({ ...f, id: slugify(e.target.value) }); }} placeholder="innov-001" /></Field>
            <Field label="title"><Input value={f.title ?? ""} onChange={(e) => { const title = e.target.value; setF((prev) => ({ ...prev, title, ...(!slugTouched ? { id: slugify(title) } : {}) })); }} placeholder="Nusantara Single-Origin" /></Field>
            <div className="sm:col-span-2"><Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={2} /></Field></div>
            <Field label="tag"><Input value={f.tag ?? ""} onChange={(e) => setF({ ...f, tag: e.target.value })} placeholder="R&D Pilot" /></Field>
            <div className="sm:col-span-2"><Field label="image / video (max 10MB image · 20MB video)"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" maxImageMB={10} /></Field></div>
            <Field label="link"><Input value={f.link ?? ""} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></Field>
            <SortIndexField value={f.sortIndex} onChange={(v) => setF({ ...f, sortIndex: v })} />
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.title || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.innovation.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[7]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[640px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Sort</th><th className="px-3 py-3 text-left font-medium">Title</th><th className="px-3 py-3 text-left font-medium">Tag</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((it: Innovation, i: number) => {
                    const realIdx = (s.innovation as Innovation[]).indexOf(it);
                    const absIdx = (page - 1) * PAGE_SIZE + i;
                    return (
                      <tr key={it.id + realIdx} {...rowProps(absIdx)} className={rowClass(absIdx)}>
                        <td className="px-3 py-2">
                          <SortIndexCell
                            value={it.sortIndex}
                            disabled={isFiltering}
                            onCommit={(v) => commitSort(it, v)}
                            onMove={(dir) => moveItem(it, dir)}
                            title={isFiltering ? "Clear search to reorder" : "Edit number or drag row — lower shows first"}
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-[#2D4A22]">{it.title}</td>
                        <td className="px-3 py-2"><span className="rounded-full bg-[#2D4A22]/10 px-2 py-0.5 text-[11px]">{it.tag}</span></td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(realIdx)} className="rounded-full border px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => remove(realIdx)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
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
