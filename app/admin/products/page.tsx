"use client";
import Image from "../../components/SafeImage";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { Product } from "../../lib/data";
import AdminShell from "../AdminShell";
import {
  Card,
  Field,
  FileUpload,
  Input,
  TextArea,
  TableWrap,
  Pagination,
  Toolbar,
  Empty,
  PAGE_SIZE,
  confirmAdminDelete,
  SortIndexField,
  toSortIndex,
  sortBySortIndex,
  renumberByMove,
  persistSortIndexDiff,
  patchSortIndex,
  SortIndexCell,
  useDragSort,
} from "../_components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "../../lib/api";

function slugify(input: string): string {
  return (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");
}

export default function ProductsPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<Product>>({});
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => {
    if (!isAuthed()) router.replace("/admin/login");
    else setGate(true);
  }, [router]);
  const counts = [
    s.products.length,
    s.productCategories.length,
    s.masterBrands.length,
    s.homeBrands.length,
    s.officialPartners.length,
    s.articles.length,
    s.edu.length,
    s.innovation.length,
    s.jobs.length,
    s.inquiries.length,
    0,
    0,
    0,
    s.salesContacts.length,
    s.socialMedia.length,
  ];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = sortBySortIndex(s.products as Product[]);
    if (catFilter !== "all") list = list.filter((p) => p.cat === catFilter);
    if (needle)
      list = list.filter((p) =>
        `${p.title} ${p.slug} ${p.cat} ${p.tag} ${p.type ?? ""} ${p.isHighlight ? "highlight" : ""}`
          .toLowerCase()
          .includes(needle),
      );
    return list;
  }, [s.products, q, catFilter]);
  useEffect(() => setPage(1), [q, catFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sortedAll = useMemo(() => sortBySortIndex(s.products as Product[]), [s.products]);
  const isFiltering = q.trim() !== "" || catFilter !== "all";
  const pathFor = (slug: string) => `/admin/products/${encodeURIComponent(slug)}`;
  const commitSort = (item: Product, sortIndex: number) => {
    s.setProducts((prev: Product[]) => prev.map((x) => (x.slug === item.slug ? { ...x, sortIndex } : x)));
    void patchSortIndex(pathFor(item.slug), sortIndex);
  };
  const reorder = (from: number, to: number) => {
    if (isFiltering) return;
    const next = renumberByMove(sortedAll, from, to);
    s.setProducts(next);
    void persistSortIndexDiff(sortedAll, next, (x) => pathFor(x.slug));
  };
  const moveItem = (item: Product, dir: -1 | 1) => {
    const from = sortedAll.findIndex((x) => x.slug === item.slug);
    if (from < 0) return;
    reorder(from, from + dir);
  };
  const { rowProps, rowClass } = useDragSort({ disabled: isFiltering, onReorder: reorder });
  const openAdd = () => {
    setF({
      type: "general",
      isHighlight: false,
      cat: s.productCategories[0]?.slug ?? "choco",
    });
    setEditIdx(null);
    setFormOpen(true);
    setErr(null);
    setSlugTouched(false);
  };
  const openEdit = (i: number) => {
    console.log("openEdit", i, s.products[i]);
    setF(s.products[i]);
    setEditIdx(i);
    setFormOpen(true);
    setErr(null);
    setSlugTouched(true);
  };
  const closeForm = () => {
    setF({});
    setEditIdx(null);
    setFormOpen(false);
    setErr(null);
    setSlugTouched(false);
  };
  const save = async () => {
    if (!f.title || !f.slug) return;
    const selectedCat = s.productCategories.find((c) => c.slug === f.cat);
    const item: Product = {
      slug: String(f.slug),
      cat: (f.cat as string) ?? "choco",
      categoryId: selectedCat?.id,
      brandId: f.brandId ?? null,
      title: String(f.title),
      note: String(f.note ?? ""),
      tag: String(f.tag ?? ""),
      img: String(f.img ?? ""),
      desc: String(f.desc ?? ""),
      type: (f.type as Product["type"]) ?? "general",
      isHighlight: Boolean(f.isHighlight),
      file: f.file ?? null,
      sortIndex: toSortIndex(f.sortIndex),
    };
    setSaving(true);
    setErr(null);
    const isEdit = editIdx !== null;
    const originalSlug = isEdit ? s.products[editIdx!]?.slug : null;
    try {
      const payload = {
        slug: item.slug,
        categoryId: item.categoryId,
        brandId: item.brandId,
        type: item.type,
        title: item.title,
        note: item.note,
        tag: item.tag,
        img: item.img,
        desc: item.desc,
        isHighlight: item.isHighlight,
        file: item.file,
        sortIndex: item.sortIndex,
      };
      if (isEdit) {
        await apiFetch(`/admin/products/${encodeURIComponent(originalSlug!)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        s.setProducts((prev: Product[]) =>
          prev.map((x, i) => (i === editIdx ? item : x)),
        );
      } else {
        await apiFetch("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        s.setProducts((prev: Product[]) => [...prev, item]);
      }
      closeForm();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      const code = (e as { code?: string })?.code;
      const status = (e as { status?: number })?.status;
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit)
          s.setProducts((prev: Product[]) =>
            prev.map((x, i) => (i === editIdx ? item : x)),
          );
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
    s.setProducts((prev: Product[]) =>
      prev.map((x, i) => (i === realIdx ? { ...x, isHighlight: next } : x)),
    );
    try {
      await apiFetch(
        `/admin/products/${encodeURIComponent(p.slug)}/highlight`,
        { method: "PATCH", body: JSON.stringify({ isHighlight: next }) },
      );
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        // revert on real error
        s.setProducts((prev: Product[]) =>
          prev.map((x, i) =>
            i === realIdx ? { ...x, isHighlight: !next } : x,
          ),
        );
        setErr(e instanceof Error ? e.message : "Highlight failed");
        setTimeout(() => setErr(null), 2500);
      }
      // network error already optimistically applied locally, keep
    }
  };
  const remove = async (realIdx: number) => {
    if (!confirmAdminDelete("this product")) return;
    const p = s.products[realIdx];
    const snapshot = [...s.products];
    s.setProducts((prev: Product[]) =>
      prev.filter((_, idx) => idx !== realIdx),
    );
    try {
      await apiFetch(`/admin/products/${encodeURIComponent(p.slug)}`, {
        method: "DELETE",
      });
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
  if (!gate)
    return (
      <div className="min-h-screen bg-white grid place-items-center p-12">
        <span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" />
      </div>
    );
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">
            CMS · {a.tabs[0]}
          </p>
          <h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">
            {a.tabs[0]}
          </h1>
        </div>
        {!formOpen && (
          <span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">
            {filtered.length}/{s.products.length}
          </span>
        )}
      </div>
      {err && (
        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">
          {err}
        </div>
      )}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">
              {editIdx !== null ? a.edit : a.add} — {a.tabs[0]}
            </h3>
            <button
              onClick={closeForm}
              className="rounded-full border px-3 py-1 text-[11px]"
            >
              ✕ Close
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="slug">
              <Input
                value={f.slug ?? ""}
                onChange={(e) => {
                  setSlugTouched(true);
                  setF({ ...f, slug: slugify(e.target.value) });
                }}
                placeholder="belgian-dark-72"
              />
            </Field>
            <Field label="category">
              <Select
                value={f.cat ?? s.productCategories[0]?.slug ?? "choco"}
                onValueChange={(v) => setF({ ...f, cat: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {s.productCategories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="brand">
              <Select
                value={f.brandId ?? ""}
                onValueChange={(v) => setF({ ...f, brandId: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {s.masterBrands
                    .filter((b) => b.isActive)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="title">
              <Input
                value={f.title ?? ""}
                onChange={(e) => {
                  const title = e.target.value;
                  setF((prev) => ({
                    ...prev,
                    title,
                    ...(!slugTouched ? { slug: slugify(title) } : {}),
                  }));
                }}
                placeholder="Belgian Dark 72%"
              />
            </Field>
            <Field label="type">
              <Select
                value={f.type ?? "general"}
                onValueChange={(v) =>
                  setF({ ...f, type: v as Product["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home-brand">Home Brand</SelectItem>
                  <SelectItem value="small-pack">Small Pack</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="note">
              <Input
                value={f.note ?? ""}
                onChange={(e) => setF({ ...f, note: e.target.value })}
                placeholder="Callets · Single origin"
              />
            </Field>
            <Field label="tag">
              <Input
                value={f.tag ?? ""}
                onChange={(e) => setF({ ...f, tag: e.target.value })}
                placeholder="Bulk · 2.5kg"
              />
            </Field>
            <Field label="isHighlight">
              <label className="flex h-10 items-center gap-2 rounded-xl border border-[#2D4A22]/15 bg-white px-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!f.isHighlight}
                  onChange={(e) =>
                    setF({ ...f, isHighlight: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#2D4A22]/20 text-[#2D4A22] focus:ring-[#2D4A22]"
                />
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.isHighlight ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/10 text-[#8B6F47]"}`}
                >
                  {f.isHighlight
                    ? "Highlighted — shows on Home"
                    : "Not highlighted"}
                </span>
              </label>
            </Field>
            <SortIndexField
              value={f.sortIndex}
              onChange={(v) => setF({ ...f, sortIndex: v })}
            />
            <div className="sm:col-span-2">
              <Field label="image / video">
                <FileUpload
                  value={f.img ?? ""}
                  onChange={(v) => setF({ ...f, img: v })}
                  accept="image/*,video/*"
                  folder="products"
                  maxImageMB={10}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="desc">
                <TextArea
                  value={f.desc ?? ""}
                  onChange={(e) => setF({ ...f, desc: e.target.value })}
                  rows={3}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Product Specification">
                <FileUpload
                  value={f.file ?? ""}
                  onChange={(v) => setF({ ...f, file: v })}
                  accept=".pdf"
                  folder="products"
                />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              disabled={!f.title || !f.slug || saving}
              className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : a.save}
            </button>
            <button
              onClick={closeForm}
              disabled={saving}
              className="rounded-full border px-6 py-2.5 text-[11px]"
            >
              {a.cancel}
            </button>
          </div>
          {(!f.title || !f.slug) && (
            <p className="mt-2 text-[11px] text-[#8B6F47]">
              Title & slug required.
            </p>
          )}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCatFilter("all")}
              className={`rounded-full border px-3 py-1.5 text-[11px] tracking-[0.06em] transition ${catFilter === "all" ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47] hover:bg-[#2D4A22]/5"}`}
            >
              All <span className="ml-1 opacity-60">{s.products.length}</span>
            </button>
            {s.productCategories
              .filter((c) => c.isActive)
              .map((c) => {
                const count = s.products.filter((p) => p.cat === c.slug).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCatFilter(c.slug)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] tracking-[0.06em] transition ${catFilter === c.slug ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47] hover:bg-[#2D4A22]/5"}`}
                  >
                    {c.name} <span className="ml-1 opacity-60">{count}</span>
                  </button>
                );
              })}
          </div>
          <Toolbar
            q={q}
            setQ={setQ}
            total={s.products.length}
            filtered={filtered.length}
            onAdd={openAdd}
            addLabel={`${a.add} ${a.tabs[0]}`}
          />
          {filtered.length === 0 ? (
            <Empty msg={a.noData} />
          ) : (
            <TableWrap>
              <table className="w-full min-w-[860px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium">Sort</th>
                    <th className="px-3 py-3 text-left font-medium">Image</th>
                    <th className="px-3 py-3 text-left font-medium">Title</th>
                    <th className="px-3 py-3 text-left font-medium">Slug</th>
                    <th className="px-3 py-3 text-left font-medium">Cat</th>
                    <th className="px-3 py-3 text-left font-medium">Type</th>
                    <th className="px-3 py-3 text-left font-medium">
                      Highlight
                    </th>
                    <th className="px-3 py-3 text-left font-medium">Tag</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((p: Product, i: number) => {
                    const realIdx = (s.products as Product[]).indexOf(p);
                    const absIdx = (page - 1) * PAGE_SIZE + i;
                    const img = p.img?.trim() ? p.img : null;
                    const isVideo =
                      !!img &&
                      (img.startsWith("data:video") ||
                        /\.(mp4|webm|mov)(\?|$)/i.test(img));
                    const typeLabel =
                      p.type === "home-brand"
                        ? "Home Brand"
                        : p.type === "small-pack"
                          ? "Small Pack"
                          : "General";
                    const typeCls =
                      p.type === "home-brand"
                        ? "bg-[#2D4A22] text-white border-[#2D4A22]"
                        : p.type === "small-pack"
                          ? "bg-[#EAF2FF] border-[#2D4A22]/15 text-[#2D4A22]"
                          : "bg-white border-[#2D4A22]/15 text-[#8B6F47]";
                    return (
                      <tr key={p.slug + realIdx} {...rowProps(absIdx)} className={rowClass(absIdx)}>
                        <td className="px-3 py-2">
                          <SortIndexCell
                            value={p.sortIndex}
                            disabled={isFiltering}
                            onCommit={(v) => commitSort(p, v)}
                            onMove={(dir) => moveItem(p, dir)}
                            title={isFiltering ? "Clear search/filters to reorder" : "Edit number or drag row — lower shows first"}
                          />
                        </td>
                        <td className="px-3 py-2">
                          {img ? (
                            isVideo ? (
                              <video
                                src={img}
                                className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0]"
                                muted
                              />
                             ) : (
                               <Image
                                 src={img}
                                 alt=""
                                 className="h-10 w-10 rounded-lg object-cover bg-[#F5EFE0]"
                                 width={40}
                                 height={40}
                               />
                             )
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F5EFE0] text-[10px] text-[#8B6F47]">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-medium text-[#2D4A22]">
                          {p.title}
                          <div className="text-[11px] font-normal text-[#8B6F47] line-clamp-1">
                            {p.note}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[#8B6F47]">{p.slug}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] ${p.cat === "matcha" ? "bg-[#E8F0E4] border-[#2D4A22]/15 text-[#2D4A22]" : p.cat === "other" ? "bg-[#FFF3E0] border-[#E65100]/20 text-[#E65100]" : "bg-[#FFF1D6] border-[#8B6F47]/15 text-[#8B6F47]"}`}
                          >
                            {p.category?.name ?? p.cat}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] ${typeCls}`}
                          >
                            {typeLabel}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => toggleHighlight(realIdx)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] ${p.isHighlight ? "bg-[#2D4A22] border-[#2D4A22] text-white" : "bg-white border-[#2D4A22]/15 text-[#8B6F47]"}`}
                          >
                            {p.isHighlight ? "Yes" : "No"}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-[#1a1a16]/70">{p.tag}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => openEdit(realIdx)}
                              className="rounded-full border bg-white px-3 py-1 text-[11px]"
                            >
                              {a.edit}
                            </button>
                            <button
                              onClick={() => remove(realIdx)}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700"
                            >
                              {a.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
              />
            </TableWrap>
          )}
        </div>
      )}
    </AdminShell>
  );
}
