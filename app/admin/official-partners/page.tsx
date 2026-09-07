"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { OfficialPartner } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, MultiFileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE } from "../_components";
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
  const sortedAll = useMemo(() => {
    return [...(s.officialPartners as OfficialPartner[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [s.officialPartners]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sortedAll;
    return sortedAll.filter((p) => `${p.id} ${p.name} ${p.description}`.toLowerCase().includes(n));
  }, [sortedAll, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltering = q.trim() !== "";
  const persistOrder = async (ordered: OfficialPartner[]) => {
    try {
      await apiFetch("/admin/official-partners/reorder", { method: "PATCH", body: JSON.stringify({ ids: ordered.map((p) => p.id) }) });
    } catch {}
  };
  const move = (id: string, dir: -1 | 1) => {
    const sorted = [...(s.officialPartners as OfficialPartner[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const pos = sorted.findIndex((p) => p.id === id);
    const next = pos + dir;
    if (pos < 0 || next < 0 || next >= sorted.length) return;
    const swapped = [...sorted];
    [swapped[pos], swapped[next]] = [swapped[next], swapped[pos]];
    const renumbered = swapped.map((p, i) => ({ ...p, order: i }));
    s.setOfficialPartners(renumbered);
    persistOrder(renumbered);
  };
  const openAdd = () => {
    const maxOrder = (s.officialPartners as OfficialPartner[]).reduce((m, p) => Math.max(m, p.order ?? 0), -1);
    setF({ isPublished: true, images: [], color: "#4A2A1F", order: maxOrder + 1 }); setEditIdx(null); setFormOpen(true); setErr(null);
  };
  const openEdit = (i: number) => {
    const p = s.officialPartners[i];
    const raw = p as unknown as Record<string, unknown>;
    const legacyLogos = Array.isArray(raw.logos) ? (raw.logos as unknown[]).map((v) => String(v ?? "")).filter(Boolean) : [];
    const baseImages = Array.isArray(p.images) && p.images.length ? [...p.images] : [];
    setF({
      ...p,
      images: baseImages.length ? baseImages : legacyLogos.length ? legacyLogos : p.image ? [p.image] : [],
    });
    setEditIdx(i); setFormOpen(true); setErr(null);
  };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); };
  const save = async () => {
    if (!f.id || !f.name) return;
    // images[] = bottom-bar logos (more than one), background = single right-side visual
    const images = (Array.isArray(f.images) ? f.images : []).map((v) => String(v ?? "")).filter(Boolean);
    let image = String(f.image ?? "");
    if (!image && images.length) image = images[0];
    const background = String(f.background ?? "");
    const rawColor = typeof f.color === "string" ? f.color.trim() : "";
    const color = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : undefined;
    const orderRaw = (f as { order?: unknown }).order;
    const order = typeof orderRaw === "number" && Number.isFinite(orderRaw) ? orderRaw : orderRaw != null && String(orderRaw).trim() !== "" && Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : editIdx !== null ? (s.officialPartners[editIdx!].order ?? editIdx) : (s.officialPartners as OfficialPartner[]).length;
    const item: OfficialPartner = {
      id: String(f.id),
      name: String(f.name),
      description: String(f.description ?? ""),
      image,
      background,
      ...(images.length ? { images } : {}),
      ...(color ? { color } : {}),
      order,
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
            <Field label="card background color"><div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(f.color ?? "") ? f.color as string : "#4A2A1F"}
                  onChange={(e) => setF({ ...f, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-[#2D4A22]/15 bg-white p-1"
                  title="Pick card background"
                />
                <Input
                  value={f.color ?? ""}
                  onChange={(e) => setF({ ...f, color: e.target.value })}
                  placeholder="#4A2A1F (empty = auto)"
                  className="w-36 font-mono"
                  maxLength={7}
                />
                {f.color && (
                  <button type="button" onClick={() => setF({ ...f, color: "" })} className="rounded-full border border-[#2D4A22]/15 bg-white px-3 py-1.5 text-[11px] text-[#8B6F47]">Auto</button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["#4A2A1F", "#2D4A22", "#5D4037", "#2E7D32", "#1565C0", "#795548", "#3E2723", "#827717", "#8B6F47"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => setF({ ...f, color: c })}
                    className={`h-6 w-6 rounded-full border-2 ${f.color === c ? "border-[#2D4A22] scale-110" : "border-white shadow"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
            <div className="sm:col-span-2"><Field label="right-side image — single (background)"><FileUpload value={f.background ?? ""} onChange={(v) => setF({ ...f, background: v })} accept="image/*" folder="partners" /></Field></div>
            <div className="sm:col-span-2"><Field label="bottom-bar logo — single (image)"><FileUpload value={f.image ?? ""} onChange={(v) => setF({ ...f, image: v })} accept="image/*" folder="partners" /></Field></div>
            <div className="sm:col-span-2"><Field label="bottom-bar logos — more than one (images[], first = main)"><MultiFileUpload value={Array.isArray(f.images) ? f.images : []} onChange={(v) => setF((prev) => ({ ...prev, images: v, image: prev.image || v[0] || "" }))} accept="image/*" folder="partners" max={4} /></Field></div>
            <Field label="order (sort number — lower shows first)">
              <Input
                type="number"
                value={f.order ?? 0}
                onChange={(e) => setF({ ...f, order: e.target.value === "" ? 0 : Number(e.target.value) })}
                placeholder="0"
              />
              <p className="mt-1 text-[10px] text-[#8B6F47]">0 = first. New items go last automatically.</p>
            </Field>
            <Field label="isPublished">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={!!f.isPublished} onChange={(e) => setF({ ...f, isPublished: e.target.checked })} className="h-4 w-4 rounded border-[#2D4A22]/20 text-[#2D4A22] focus:ring-[#2D4A22]" />
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.isPublished ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/10 text-[#8B6F47]"}`}>{f.isPublished ? "Published" : "Draft"}</span>
              </label>
            </Field>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.id || !f.name || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {(!f.id || !f.name) && <p className="mt-2 text-[11px] text-[#8B6F47]">ID & name required. ID must be unique.</p>}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.officialPartners.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${a.tabs[1]}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[940px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Order</th><th className="px-3 py-3 text-left font-medium">Preview</th><th className="px-3 py-3 text-left font-medium">Color</th><th className="px-3 py-3 text-left font-medium">Name / ID</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-left font-medium">Published</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((p: OfficialPartner) => {
                    const realIdx = (s.officialPartners as OfficialPartner[]).indexOf(p);
                    const rightVisual = p.background || "";
                    const bottomLogos = Array.isArray(p.images) && p.images.length ? p.images.filter(Boolean) : p.image ? [p.image] : [];
                    const cardColor = p.color && /^#[0-9a-fA-F]{6}$/.test(p.color) ? p.color : "#4A2A1F";
                    return (
                      <tr key={p.id + realIdx} className="hover:bg-white/60">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1" title={isFiltering ? "Clear search to reorder" : `Order ${p.order ?? 0} — lower shows first`}>
                            <span className="min-w-[28px] rounded-full bg-[#2D4A22]/10 px-2 py-1 text-center text-[11px] font-medium text-[#2D4A22]">{p.order ?? 0}</span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={isFiltering}
                                onClick={() => move(p.id, -1)}
                                className="rounded border bg-white px-1.5 text-[10px] leading-tight disabled:opacity-30"
                                title="Move up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={isFiltering}
                                onClick={() => move(p.id, 1)}
                                className="rounded border bg-white px-1.5 text-[10px] leading-tight disabled:opacity-30"
                                title="Move down"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 rounded-xl p-1.5" style={{ background: cardColor }} title={`card bg ${cardColor} · ${bottomLogos.length} logo(s)`}>
                            {rightVisual ? (
                              <img src={rightVisual} alt="" className="h-10 w-10 rounded-lg object-contain" />
                            ) : <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/20 text-[10px] text-white">—</span>}
                            <div className="flex -space-x-1.5 rounded-md bg-[#CFC6B8] px-1.5 py-1">
                              {bottomLogos.length ? bottomLogos.slice(0, 2).map((src: string, i: number) => (
                                <img key={src + i} src={src} alt="" className="h-6 w-auto max-w-[48px] rounded object-contain" />
                              )) : <span className="text-[10px] text-black/50">no logo</span>}
                              {bottomLogos.length > 2 && <span className="text-[10px] text-black/60">+{bottomLogos.length - 2}</span>}
                            </div>
                            {bottomLogos.length > 1 && <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium">×{bottomLogos.length}</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {p.color && /^#[0-9a-fA-F]{6}$/.test(p.color) ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2D4A22]/10 bg-white px-2 py-1 font-mono text-[11px]" title={p.color}>
                              <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: p.color }} />
                              {p.color}
                            </span>
                          ) : <span className="text-[11px] text-[#8B6F47]">auto</span>}
                        </td>
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
