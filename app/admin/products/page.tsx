"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { Product } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE } from "../_components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "../../lib/api";

export default function ProductsPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<Product>>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return s.products as Product[];
    return (s.products as Product[]).filter((p) => `${p.title} ${p.slug} ${p.cat} ${p.tag} ${p.type ?? ""} ${p.isHighlight ? "highlight" : ""}`.toLowerCase().includes(needle));
  }, [s.products, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({ type: "general", isHighlight: false, cat: "choco" }); setEditIdx(null); setFormOpen(true); setErr(null); };
  const openEdit = (i: number) => { setF(s.products[i]); setEditIdx(i); setFormOpen(true); setErr(null); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); };
  const save = async () => {
    if (!f.title || !f.slug) return;
    const item: Product = { slug: String(f.slug), cat: (f.cat as any) ?? "choco", title: String(f.title), note: String(f.note ?? ""), tag: String(f.tag ?? ""), img: String(f.img ?? ""), desc: String(f.desc ?? ""), type: (f.type as Product["type"]) ?? "general", isHighlight: Boolean(f.isHighlight) };
    setSaving(true);
    setErr(null);
    const isEdit = editIdx !== null;
    const originalSlug = isEdit ? s.products[editIdx!]?.slug : null;
    try {
      if (isEdit) {
        // PUT /admin/products/:slug — if slug changed, backend validates uniqueness
        await apiFetch(`/admin/products/${encodeURIComponent(originalSlug!)}`, { method: "PUT", body: JSON.stringify(item) });
        s.setProducts((prev: Product[]) => prev.map((x, i) => i === editIdx ? item : x));
      } else {
        await apiFetch("/admin/products", { method: "POST", body: JSON.stringify(item) });
        s.setProducts((prev: Product[]) => [...prev, item]);
      }
      closeForm();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      const code = (e as { code?: string })?.code;
      const status = (e as { status?: number })?.status;
      // Network error → fallback to local only (offline dev)
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit) s.setProducts((prev: Product[]) => prev.map((x, i) => i === editIdx ? item : x));
        else s.setProducts((prev: Product[]) => [...prev, item]);
        closeForm();
      } else {
        if (code === "CONFLICT") setErr("Slug already exists (409 CONFLICT)");
        else setErr(msg);
      }
    } finally {
      setSaving(false);
    }
  };
  const toggleHighlight = async (realIdx: number) => {
    const p = s.products[realIdx];
    const next = !p.isHighlight;
    // optimistic
    s.setProducts((prev: Product[]) => prev.map((x, i) => i === realIdx ? { ...x, isHighlight: next } : x));
    try {
      await apiFetch(`/admin/products/${encodeURIComponent(p.slug)}/highlight`, { method: "PATCH", body: JSON.stringify({ isHighlight: next }) });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        // revert on real error
        s.setProducts((prev: Product[]) => prev.map((x, i) => i === realIdx ? { ...x, isHighlight: !next } : x));
        setErr(e instanceof Error ? e.message : "Highlight failed");
        setTimeout(() => setErr(null), 2500);
      }
      // network error already optimistically applied locally, keep
    }
  };
  const remove = async (realIdx: number) => {
    const p = s.products[realIdx];
    const snapshot = [...s.products];
    s.setProducts((prev: Product[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/products/${encodeURIComponent(p.slug)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setProducts(snapshot);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[0]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[0]}</h1></div>
        {!formOpen && <span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.products.length}</span>}
      </div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[0]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="slug"><Input value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="belgian-dark-72" /></Field>
            <Field label="category"><Select value={f.cat ?? "choco"} onValueChange={(v) => setF({ ...f, cat: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="choco">choco</SelectItem><SelectItem value="matcha">matcha</SelectItem></SelectContent></Select></Field>
            <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Belgian Dark 72%" /></Field>
            <Field label="type"><Select value={f.type ?? "general"} onValueChange={(v) => setF({ ...f, type: v as Product["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="home-brand">Home Brand</SelectItem><SelectItem value="small-pack">Small Pack</SelectItem><SelectItem value="general">General</SelectItem></SelectContent></Select></Field>
            <Field label="note"><Input value={f.note ?? ""} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Callets · Single origin" /></Field>
            <Field label="tag"><Input value={f.tag ?? ""} onChange={(e) => setF({ ...f, tag: e.target.value })} placeholder="Bulk · 2.5kg" /></Field>
            <Field label="isHighlight">
              <label className="flex h-10 items-center gap-2 rounded-xl border border-[#2D4A22]/15 bg-white px-3 cursor-pointer select-none">
                <input type="checkbox" checked={!!f.isHighlight} onChange={(e) => setF({ ...f, isHighlight: e.target.checked })} className="h-4 w-4 rounded border-[#2D4A22]/20 text-[#2D4A22] focus:ring-[#2D4A22]" />
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.isHighlight ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/10 text-[#8B6F47]"}`}>{f.isHighlight ? "Highlighted — shows on Home" : "Not highlighted"}</span>
              </label>
            </Field>
            <div className="sm:col-span-2"><Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" folder="products" /></Field></div>
            <div className="sm:col-span-2"><Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={3} /></Field></div>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.title || !f.slug || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {(!f.title || !f.slug) && <p className="mt-2 text-[11px] text-[#8B6F47]">Title & slug required.</p>}
          <p className="mt-2 text-[10px] text-[#8B6F47]">API: <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">POST /admin/products</code> · <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">PUT /admin/products/:slug</code> · fallback localStorage</p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.products.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[0]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[860px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Image</th><th className="px-3 py-3 text-left font-medium">Title</th><th className="px-3 py-3 text-left font-medium">Slug</th><th className="px-3 py-3 text-left font-medium">Cat</th><th className="px-3 py-3 text-left font-medium">Type</th><th className="px-3 py-3 text-left font-medium">Highlight</th><th className="px-3 py-3 text-left font-medium">Tag</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((p: Product) => {
                    const realIdx = (s.products as Product[]).indexOf(p);
                    const isVideo = p.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(p.img ?? "");
                    const typeLabel = p.type === "home-brand" ? "Home Brand" : p.type === "small-pack" ? "Small Pack" : "General";
                    const typeCls = p.type === "home-brand" ? "bg-[#2D4A22] text-white border-[#2D4A22]" : p.type === "small-pack" ? "bg-[#EAF2FF] border-[#2D4A22]/15 text-[#2D4A22]" : "bg-white border-[#2D4A22]/15 text-[#8B6F47]";
                    return (
                      <tr key={p.slug + realIdx} className="hover:bg-white/60">
                        <td className="px-3 py-2">{isVideo ? <video src={p.img} className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0]" muted /> : <img src={p.img} alt="" className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0]" />}</td>
                        <td className="px-3 py-2 font-medium text-[#2D4A22]">{p.title}<div className="text-[11px] font-normal text-[#8B6F47] line-clamp-1">{p.note}</div></td>
                        <td className="px-3 py-2 text-[#8B6F47]">{p.slug}</td>
                        <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 text-[11px] ${p.cat === "matcha" ? "bg-[#E8F0E4] border-[#2D4A22]/15 text-[#2D4A22]" : "bg-[#FFF1D6] border-[#8B6F47]/15 text-[#8B6F47]"}`}>{p.cat}</span></td>
                        <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 text-[11px] ${typeCls}`}>{typeLabel}</span></td>
                        <td className="px-3 py-2"><button onClick={() => toggleHighlight(realIdx)} className={`rounded-full border px-2.5 py-1 text-[11px] ${p.isHighlight ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47]"}`}>{p.isHighlight ? "Yes" : "No"}</button></td>
                        <td className="px-3 py-2 text-[#1a1a16]/70">{p.tag}</td>
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
