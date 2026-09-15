"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore, apiCreateProductCategory, apiUpdateProductCategory, apiToggleCategoryActive, apiDeleteProductCategory } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { ProductCategory } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete } from "../_components";

function slugify(input: string): string {
  return (input ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/g, "");
}

export default function ProductCategoriesPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<ProductCategory>>({});
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
    const needle = q.trim().toLowerCase();
    if (!needle) return s.productCategories;
    return s.productCategories.filter((c) => `${c.name} ${c.slug} ${c.description ?? ""}`.toLowerCase().includes(needle));
  }, [s.productCategories, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({ isActive: true }); setEditIdx(null); setFormOpen(true); setErr(null); setSlugTouched(false); };
  const openEdit = (i: number) => { setF(s.productCategories[i]); setEditIdx(i); setFormOpen(true); setErr(null); setSlugTouched(true); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); setSlugTouched(false); };
  const save = async () => {
    if (!f.name || !f.slug) return;
    const payload = { slug: slugify(f.slug!), name: String(f.name), description: String(f.description ?? ""), isActive: f.isActive !== false, isHighlight: !!f.isHighlight };
    setSaving(true);
    setErr(null);
    const isEdit = editIdx !== null;
    const originalSlug = isEdit ? s.productCategories[editIdx!]?.slug : null;
    try {
      if (isEdit) {
        const updated = await apiUpdateProductCategory(originalSlug!, payload);
        s.setProductCategories((prev) => prev.map((x, i) => i === editIdx ? { ...x, ...updated, slug: updated.slug || x.slug } : x));
      } else {
        const created = await apiCreateProductCategory(payload);
        s.setProductCategories((prev) => [...prev, { id: created.id || slugify(f.name!), slug: created.slug || payload.slug, name: created.name || payload.name, description: created.description ?? payload.description, isActive: created.isActive ?? payload.isActive, isHighlight: created.isHighlight ?? payload.isHighlight }]);
      }
      closeForm();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      const code = (e as { code?: string })?.code;
      const status = (e as { status?: number })?.status;
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit) s.setProductCategories((prev) => prev.map((x, i) => i === editIdx ? { ...x, ...payload } : x));
        else s.setProductCategories((prev) => [...prev, { id: slugify(f.name!), ...payload }]);
        closeForm();
      } else {
        if (code === "CONFLICT") setErr("Slug already exists (409 CONFLICT)");
        else setErr(msg);
      }
    } finally {
      setSaving(false);
    }
  };
  const toggleActive = async (realIdx: number) => {
    const c = s.productCategories[realIdx];
    const next = !c.isActive;
    s.setProductCategories((prev) => prev.map((x, i) => i === realIdx ? { ...x, isActive: next } : x));
    try {
      await apiToggleCategoryActive(c.slug, next);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setProductCategories((prev) => prev.map((x, i) => i === realIdx ? { ...x, isActive: !next } : x));
        setErr(e instanceof Error ? e.message : "Toggle failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  const toggleHighlight = async (realIdx: number) => {
    const c = s.productCategories[realIdx];
    const next = !c.isHighlight;
    s.setProductCategories((prev) => prev.map((x, i) => i === realIdx ? { ...x, isHighlight: next } : x));
    try {
      await apiUpdateProductCategory(c.slug, { isHighlight: next });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setProductCategories((prev) => prev.map((x, i) => i === realIdx ? { ...x, isHighlight: !next } : x));
        setErr(e instanceof Error ? e.message : "Highlight failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  const remove = async (realIdx: number) => {
    if (!confirmAdminDelete("this category")) return;
    const c = s.productCategories[realIdx];
    const snapshot = [...s.productCategories];
    s.setProductCategories((prev) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiDeleteProductCategory(c.slug);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setProductCategories(snapshot);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · Categories</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">Categories</h1></div>
        {!formOpen && <span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.productCategories.length}</span>}
      </div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — Category</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="slug"><Input value={f.slug ?? ""} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} placeholder="choco" /></Field>
            <Field label="name"><Input value={f.name ?? ""} onChange={(e) => { const name = e.target.value; setF((prev) => ({ ...prev, name, ...(!slugTouched ? { slug: slugify(name) } : {}) })); }} placeholder="Chocolate" /></Field>
            <div className="sm:col-span-2"><Field label="description"><TextArea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} placeholder="All chocolate products" /></Field></div>
            <Field label="active">
              <label className="flex h-10 items-center gap-2 rounded-xl border border-[#2D4A22]/15 bg-white px-3 cursor-pointer select-none">
                <input type="checkbox" checked={f.isActive !== false} onChange={(e) => setF({ ...f, isActive: e.target.checked })} className="h-4 w-4 rounded border-[#2D4A22]/20 text-[#2D4A22] focus:ring-[#2D4A22]" />
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.isActive !== false ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/10 text-[#8B6F47]"}`}>{f.isActive !== false ? "Active" : "Inactive"}</span>
              </label>
            </Field>
            <Field label="show on home">
              <label className="flex h-10 items-center gap-2 rounded-xl border border-[#2D4A22]/15 bg-white px-3 cursor-pointer select-none">
                <input type="checkbox" checked={!!f.isHighlight} onChange={(e) => setF({ ...f, isHighlight: e.target.checked })} className="h-4 w-4 rounded border-[#2D4A22]/20 text-[#2D4A22] focus:ring-[#2D4A22]" />
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.isHighlight ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/10 text-[#8B6F47]"}`}>{f.isHighlight ? "Highlighted — shows on Home" : "Not highlighted"}</span>
              </label>
            </Field>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.name || !f.slug || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {(!f.name || !f.slug) && <p className="mt-2 text-[11px] text-[#8B6F47]">Name & slug required.</p>}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.productCategories.length} filtered={filtered.length} onAdd={openAdd} addLabel="Add Category" />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[600px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Name</th><th className="px-3 py-3 text-left font-medium">Slug</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-left font-medium">Active</th><th className="px-3 py-3 text-left font-medium">Home</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((c: ProductCategory) => {
                    const realIdx = s.productCategories.indexOf(c);
                    return (
                      <tr key={c.id || c.slug} className="hover:bg-white/60">
                        <td className="px-3 py-2 font-medium text-[#2D4A22]">{c.name}</td>
                        <td className="px-3 py-2 text-[#8B6F47]">{c.slug}</td>
                        <td className="px-3 py-2 text-[#1a1a16]/70 line-clamp-1">{c.description}</td>
                        <td className="px-3 py-2"><button onClick={() => toggleActive(realIdx)} className={`rounded-full border px-2.5 py-1 text-[11px] ${c.isActive ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47]"}`}>{c.isActive ? "Yes" : "No"}</button></td>
                        <td className="px-3 py-2"><button onClick={() => toggleHighlight(realIdx)} className={`rounded-full border px-2.5 py-1 text-[11px] ${c.isHighlight ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47]"}`}>{c.isHighlight ? "Yes" : "No"}</button></td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5">
                          <button onClick={() => openEdit(realIdx)} className="rounded-full border bg-white px-3 py-1 text-[11px]">{a.edit}</button>
                          <button onClick={() => remove(realIdx)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button>
                        </div></td>
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
