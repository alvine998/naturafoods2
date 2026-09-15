"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { HomeBrand } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete } from "../_components";
import { apiFetch } from "../../lib/api";

function slugify(input: string): string {
  return (input ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/g, "");
}

export default function HomeBrandsPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<HomeBrand>>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.productCategories.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.homeBrands;
    return s.homeBrands.filter((h) => `${h.id} ${h.name} ${h.desc}`.toLowerCase().includes(n));
  }, [s.homeBrands, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({}); setEditIdx(null); setFormOpen(true); setErr(null); setSlugTouched(false); };
  const openEdit = (i: number) => { const h = s.homeBrands[i]; setF({ ...h }); setEditIdx(i); setFormOpen(true); setErr(null); setSlugTouched(true); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); setSlugTouched(false); };
  const save = async () => {
    if (!f.id || !f.name) return;
    const item: HomeBrand = {
      id: String(f.id),
      name: String(f.name),
      image: String(f.image ?? ""),
      desc: String(f.desc ?? ""),
    };
    if (editIdx === null) {
      const exists = s.homeBrands.some((h) => h.id === item.id);
      if (exists) { setErr("ID already exists"); return; }
    } else {
      const otherExists = s.homeBrands.some((h, i) => i !== editIdx && h.id === item.id);
      if (otherExists) { setErr("ID already exists"); return; }
    }
    setSaving(true); setErr(null);
    const isEdit = editIdx !== null;
    const originalId = isEdit ? s.homeBrands[editIdx!].id : null;
    try {
      if (isEdit) {
        await apiFetch(`/admin/home-brands/${encodeURIComponent(originalId!)}`, { method: "PUT", body: JSON.stringify(item) });
        s.setHomeBrands((prev: HomeBrand[]) => prev.map((x, i) => i === editIdx ? item : x));
      } else {
        await apiFetch("/admin/home-brands", { method: "POST", body: JSON.stringify(item) });
        s.setHomeBrands((prev: HomeBrand[]) => [...prev, item]);
      }
      closeForm();
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      const msg = e instanceof Error ? e.message : "Save failed";
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit) s.setHomeBrands((prev: HomeBrand[]) => prev.map((x, i) => i === editIdx ? item : x));
        else s.setHomeBrands((prev: HomeBrand[]) => [...prev, item]);
        closeForm();
      } else {
        if (code === "CONFLICT") setErr("ID already exists (409)");
        else setErr(msg);
      }
    } finally { setSaving(false); }
  };
  const remove = async (realIdx: number) => {
    if (!confirmAdminDelete("this home brand")) return;
    const h = s.homeBrands[realIdx];
    const snap = [...s.homeBrands];
    s.setHomeBrands((prev: HomeBrand[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/home-brands/${encodeURIComponent(h.id)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setHomeBrands(snap);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[2]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[2]}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.homeBrands.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[1]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="id *"><Input value={f.id ?? ""} onChange={(e) => { setSlugTouched(true); setF({ ...f, id: slugify(e.target.value) }); }} placeholder="brand-name" /></Field>
            <Field label="name *"><Input value={f.name ?? ""} onChange={(e) => { const name = e.target.value; setF((prev) => ({ ...prev, name, ...(!slugTouched ? { id: slugify(name) } : {}) })); }} placeholder="Brand Name" /></Field>
            <div className="sm:col-span-2"><Field label="description"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={3} placeholder="Short description for this home brand" /></Field></div>
            <div className="sm:col-span-2"><Field label="image"><FileUpload value={f.image ?? ""} onChange={(v) => setF({ ...f, image: v })} accept="image/*" folder="home-brands" /></Field></div>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.id || !f.name || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {(!f.id || !f.name) && <p className="mt-2 text-[11px] text-[#8B6F47]">ID & name required. ID must be unique.</p>}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.homeBrands.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[1]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[640px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Preview</th><th className="px-3 py-3 text-left font-medium">Name / ID</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((h: HomeBrand) => {
                    const realIdx = s.homeBrands.indexOf(h);
                    return (
                      <tr key={h.id + realIdx} className="hover:bg-white/60">
                        <td className="px-3 py-2">
                          {h.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={h.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          ) : <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F5EFE0] text-[10px] text-[#8B6F47]">—</span>}
                        </td>
                        <td className="px-3 py-2"><div className="font-medium text-[#2D4A22]">{h.name}</div><div className="text-[11px] text-[#8B6F47]">{h.id}</div></td>
                        <td className="px-3 py-2 max-w-[280px]"><div className="truncate text-[#1a1a16]/70" title={h.desc}>{h.desc || "—"}</div></td>
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
