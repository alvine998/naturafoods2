"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "../../components/SafeImage";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { HomeBrand } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete, SortIndexField, toSortIndex, sortBySortIndex, renumberByMove, persistSortIndexDiff, patchSortIndex, SortIndexCell, useDragSort } from "../_components";
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
  const counts = [s.products.length, s.productCategories.length, s.masterBrands.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const sortedAll = useMemo(() => sortBySortIndex(s.homeBrands), [s.homeBrands]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sortedAll;
    return sortedAll.filter((h) => `${h.id} ${h.name} ${h.desc}`.toLowerCase().includes(n));
  }, [sortedAll, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltering = q.trim() !== "";
  const pathFor = (id: string) => `/admin/home-brands/${encodeURIComponent(id)}`;
  const commitSort = (item: HomeBrand, sortIndex: number) => {
    s.setHomeBrands((prev: HomeBrand[]) => prev.map((x) => (x.id === item.id ? { ...x, sortIndex } : x)));
    void patchSortIndex(pathFor(item.id), sortIndex);
  };
  const reorder = (from: number, to: number) => {
    if (isFiltering) return;
    const next = renumberByMove(sortedAll, from, to);
    s.setHomeBrands(next);
    void persistSortIndexDiff(sortedAll, next, (x) => pathFor(x.id));
  };
  const moveItem = (item: HomeBrand, dir: -1 | 1) => {
    const from = sortedAll.findIndex((x) => x.id === item.id);
    if (from < 0) return;
    reorder(from, from + dir);
  };
  const { rowProps, rowClass } = useDragSort({ disabled: isFiltering, onReorder: reorder });
  const openAdd = () => { setF({}); setEditIdx(null); setFormOpen(true); setErr(null); setSlugTouched(false); };
  const openEdit = (i: number) => {
    const h = s.homeBrands[i];
    const raw = h as unknown as Record<string, unknown>;
    const fromSnake = Array.isArray(raw.brand_ids) ? (raw.brand_ids as unknown[]) : [];
    const fromJoin = Array.isArray(raw.brands)
      ? (raw.brands as unknown[]).map((b) =>
          b && typeof b === "object" ? String((b as Record<string, unknown>).id ?? "") : String(b ?? ""),
        )
      : [];
    const brandIds = [...(h.brandIds ?? []), ...fromSnake, ...fromJoin]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .flatMap((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    setF({ ...h, brandIds });
    setEditIdx(i); setFormOpen(true); setErr(null); setSlugTouched(true);
  };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); setSlugTouched(false); };
  const save = async () => {
    if (!f.id || !f.name) return;
    const brandIds = Array.isArray(f.brandIds) ? f.brandIds.filter(Boolean).map(String) : [];
    const item: HomeBrand = {
      id: String(f.id),
      name: String(f.name),
      image: String(f.image ?? ""),
      desc: String(f.desc ?? ""),
      brandIds,
      sortIndex: toSortIndex(f.sortIndex),
    };
    // backend uses snake_case `brand_ids` — send both spellings
    const payload = { ...item, brand_ids: brandIds };
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
        await apiFetch(`/admin/home-brands/${encodeURIComponent(originalId!)}`, { method: "PUT", body: JSON.stringify(payload) });
        s.setHomeBrands((prev: HomeBrand[]) => prev.map((x, i) => i === editIdx ? item : x));
      } else {
        await apiFetch("/admin/home-brands", { method: "POST", body: JSON.stringify(payload) });
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
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[3]}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{a.tabs[3]}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.homeBrands.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {a.tabs[3]}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="id *"><Input value={f.id ?? ""} onChange={(e) => { setSlugTouched(true); setF({ ...f, id: slugify(e.target.value) }); }} placeholder="brand-name" /></Field>
            <Field label="name *"><Input value={f.name ?? ""} onChange={(e) => { const name = e.target.value; setF((prev) => ({ ...prev, name, ...(!slugTouched ? { id: slugify(name) } : {}) })); }} placeholder="Brand Name" /></Field>
            <div className="sm:col-span-2"><Field label="description"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={3} placeholder="Short description for this home brand" /></Field></div>
            <div className="sm:col-span-2"><Field label="image"><FileUpload value={f.image ?? ""} onChange={(v) => setF({ ...f, image: v })} accept="image/*" folder="home-brands" /></Field></div>
            <SortIndexField value={f.sortIndex} onChange={(v) => setF({ ...f, sortIndex: v })} />
            {s.masterBrands.length > 0 && (
              <div className="sm:col-span-2">
                <Field label="Brands">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {s.masterBrands.filter((b) => b.isActive).map((b) => {
                      const checked = (f.brandIds ?? []).includes(b.id);
                      return (
                        <label key={b.id} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] cursor-pointer transition-all ${checked ? "bg-[#8B6F47] text-white border-[#8B6F47]" : "bg-white text-[#8B6F47] border-[#8B6F47]/20 hover:border-[#8B6F47]/40"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const prev = f.brandIds ?? [];
                              setF({ ...f, brandIds: checked ? prev.filter((id) => id !== b.id) : [...prev, b.id] });
                            }}
                            className="sr-only"
                          />
                          {b.name}
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.id || !f.name || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {(!f.id || !f.name) && <p className="mt-2 text-[11px] text-[#8B6F47]">ID & name required. ID must be unique.</p>}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.homeBrands.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[3]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[640px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Sort</th><th className="px-3 py-3 text-left font-medium">Preview</th><th className="px-3 py-3 text-left font-medium">Name / ID</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-left font-medium">Brands</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((h: HomeBrand, i: number) => {
                    const realIdx = s.homeBrands.indexOf(h);
                    const absIdx = (page - 1) * PAGE_SIZE + i;
                    return (
                      <tr key={h.id + realIdx} {...rowProps(absIdx)} className={rowClass(absIdx)}>
                        <td className="px-3 py-2">
                          <SortIndexCell
                            value={h.sortIndex}
                            disabled={isFiltering}
                            onCommit={(v) => commitSort(h, v)}
                            onMove={(dir) => moveItem(h, dir)}
                            title={isFiltering ? "Clear search to reorder" : "Edit number or drag row — lower shows first"}
                          />
                        </td>
                        <td className="px-3 py-2">
                          {h.image ? (
                            <Image src={h.image} alt="" className="h-10 w-10 rounded-lg object-cover" width={40} height={40} />
                          ) : <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F5EFE0] text-[10px] text-[#8B6F47]">—</span>}
                        </td>
                        <td className="px-3 py-2"><div className="font-medium text-[#2D4A22]">{h.name}</div><div className="text-[11px] text-[#8B6F47]">{h.id}</div></td>
                        <td className="px-3 py-2 max-w-[280px]"><div className="truncate text-[#1a1a16]/70" title={h.desc}>{h.desc || "—"}</div></td>
                        <td className="px-3 py-2">
                          {(h.brandIds ?? []).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {h.brandIds!.map((bid) => {
                                const mb = s.masterBrands.find((b) => b.id === bid);
                                return <span key={bid} className="inline-block rounded-full bg-[#8B6F47]/10 px-2 py-0.5 text-[10px] text-[#8B6F47]">{mb?.name ?? bid}</span>;
                              })}
                            </div>
                          ) : <span className="text-[#8B6F47]/40">—</span>}
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
