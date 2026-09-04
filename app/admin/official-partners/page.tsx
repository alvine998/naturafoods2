"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { OfficialPartner } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE } from "../_components";
import { apiFetch } from "../../lib/api";

export default function OfficialPartnersPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<OfficialPartner>>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.officialPartners as OfficialPartner[];
    return (s.officialPartners as OfficialPartner[]).filter((p) => `${p.id} ${p.name} ${p.description}`.toLowerCase().includes(n));
  }, [s.officialPartners, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({ isPublished: true }); setEditIdx(null); setFormOpen(true); setErr(null); };
  const openEdit = (i: number) => { setF(s.officialPartners[i]); setEditIdx(i); setFormOpen(true); setErr(null); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); };
  const save = async () => {
    if (!f.id || !f.name) return;
    const item: OfficialPartner = {
      id: String(f.id),
      name: String(f.name),
      description: String(f.description ?? ""),
      image: String(f.image ?? ""),
      background: String(f.background ?? ""),
      isPublished: Boolean(f.isPublished),
    };
    // local duplicate check (optimistic)
    if (editIdx === null) {
      const exists = (s.officialPartners as OfficialPartner[]).some((p) => p.id === item.id);
      if (exists) { setErr("ID already exists"); return; }
    } else {
      const idx = editIdx;
      const otherExists = (s.officialPartners as OfficialPartner[]).some((p, i) => i !== idx && p.id === item.id);
      if (otherExists) { setErr("ID already exists"); return; }
    }
    setSaving(true); setErr(null);
    const isEdit = editIdx !== null;
    const originalId = isEdit ? s.officialPartners[editIdx!].id : null;
    try {
      if (isEdit) {
        await apiFetch(`/admin/official-partners/${encodeURIComponent(originalId!)}`, { method: "PUT", body: JSON.stringify(item) });
        s.setOfficialPartners((prev: OfficialPartner[]) => prev.map((x, i) => i === editIdx ? item : x));
      } else {
        await apiFetch("/admin/official-partners", { method: "POST", body: JSON.stringify(item) });
        s.setOfficialPartners((prev: OfficialPartner[]) => [...prev, item]);
      }
      closeForm();
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      const msg = e instanceof Error ? e.message : "Save failed";
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit) s.setOfficialPartners((prev: OfficialPartner[]) => prev.map((x, i) => i === editIdx ? item : x));
        else s.setOfficialPartners((prev: OfficialPartner[]) => [...prev, item]);
        closeForm();
      } else {
        if (code === "CONFLICT") setErr("ID already exists (409)");
        else setErr(msg);
      }
    } finally { setSaving(false); }
  };
  const togglePublish = async (realIdx: number) => {
    const p = s.officialPartners[realIdx];
    const next = !p.isPublished;
    s.setOfficialPartners((prev: OfficialPartner[]) => prev.map((x, i) => i === realIdx ? { ...x, isPublished: next } : x));
    try {
      await apiFetch(`/admin/official-partners/${encodeURIComponent(p.id)}/publish`, { method: "PATCH", body: JSON.stringify({ isPublished: next }) });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setOfficialPartners((prev: OfficialPartner[]) => prev.map((x, i) => i === realIdx ? { ...x, isPublished: !next } : x));
        setErr(e instanceof Error ? e.message : "Publish toggle failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  const remove = async (realIdx: number) => {
    const p = s.officialPartners[realIdx];
    const snap = [...s.officialPartners];
    s.setOfficialPartners((prev: OfficialPartner[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/official-partners/${encodeURIComponent(p.id)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setOfficialPartners(snap);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[1]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[1]}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.officialPartners.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[1]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="id *"><Input value={f.id ?? ""} onChange={(e) => setF({ ...f, id: e.target.value })} placeholder="bensdorp" /></Field>
            <Field label="name *"><Input value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Bens Dorp" /></Field>
            <div className="sm:col-span-2"><Field label="description"><TextArea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3} placeholder="Short description for the partner card" /></Field></div>
            <div className="sm:col-span-2"><Field label="image (card image)"><FileUpload value={f.image ?? ""} onChange={(v) => setF({ ...f, image: v })} accept="image/*" folder="partners" /></Field></div>
            <div className="sm:col-span-2"><Field label="background (hero / card background)"><FileUpload value={f.background ?? ""} onChange={(v) => setF({ ...f, background: v })} accept="image/*" folder="partners" /></Field></div>
            <Field label="isPublished">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={!!f.isPublished} onChange={(e) => setF({ ...f, isPublished: e.target.checked })} className="h-4 w-4 rounded border-[#2D4A22]/20 text-[#2D4A22] focus:ring-[#2D4A22]" />
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.isPublished ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/10 text-[#8B6F47]"}`}>{f.isPublished ? "Published" : "Draft"}</span>
              </label>
            </Field>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.id || !f.name || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {(!f.id || !f.name) && <p className="mt-2 text-[11px] text-[#8B6F47]">ID & name required. ID must be unique.</p>}
          <p className="mt-2 text-[10px] text-[#8B6F47]">API: <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">POST /admin/official-partners</code> · <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">PUT /admin/official-partners/:id</code> · <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">PATCH /admin/official-partners/:id/publish</code></p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.officialPartners.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[1]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[820px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Image</th><th className="px-3 py-3 text-left font-medium">Background</th><th className="px-3 py-3 text-left font-medium">Name / ID</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-left font-medium">Published</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((p: OfficialPartner) => {
                    const realIdx = (s.officialPartners as OfficialPartner[]).indexOf(p);
                    return (
                      <tr key={p.id + realIdx} className="hover:bg-white/60">
                        <td className="px-3 py-2">{p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0] border border-[#2D4A22]/10" /> : <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F5EFE0] text-[10px] text-[#8B6F47]">—</span>}</td>
                        <td className="px-3 py-2">{p.background ? <img src={p.background} alt="" className="h-10 w-16 rounded-lg object-cover bg-[#F5EFE0] border border-[#2D4A22]/10" /> : <span className="grid h-10 w-16 place-items-center rounded-lg bg-[#F5EFE0] text-[10px] text-[#8B6F47]">—</span>}</td>
                        <td className="px-3 py-2"><div className="font-medium text-[#2D4A22]">{p.name}</div><div className="text-[11px] text-[#8B6F47]">{p.id}</div></td>
                        <td className="px-3 py-2 max-w-[280px]"><div className="truncate text-[#1a1a16]/70" title={p.description}>{p.description || "—"}</div></td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => togglePublish(realIdx)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] ${p.isPublished ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47]"}`}
                          >
                            {p.isPublished ? "Published" : "Draft"}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(realIdx)} className="rounded-full border bg-white px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => remove(realIdx)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
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
