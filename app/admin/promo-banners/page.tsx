"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "../../components/SafeImage";
import { useLang } from "../../i18n";
import { normalizePromoBanners, useStore } from "../../lib/store";
import { safeHttpUrl } from "../../lib/safe-url";
import { isAuthed } from "../../lib/auth";
import type { PromoBanner, PromoBannerStatus } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete, sortBySortIndex } from "../_components";
import { apiFetch, buildQuery } from "../../lib/api";

function StatusBadge({ status }: { status: PromoBannerStatus }) {
  const active = status === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${active ? "bg-[#2D4A22] text-white" : "bg-[#8B6F47]/15 text-[#8B6F47]"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white animate-pulse" : "bg-[#8B6F47]"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// Backend owns the id (UUID) and the order — payloads only carry
// {name, description, status, image} (backend.md:19).
function toPayload(v: Partial<PromoBanner>) {
  return {
    name: String(v.name ?? "").trim(),
    description: String(v.description ?? ""),
    status: (v.status === "inactive" ? "inactive" : "active") as PromoBannerStatus,
    image: String(v.imageEn?.trim() ? v.imageEn : v.imageId?.trim() ? v.imageId : v.imageZn ?? ""),
    imageId: String(v.imageId ?? ""),
    imageEn: String(v.imageEn ?? ""),
    imageZn: String(v.imageZn ?? ""),
    image_id: String(v.imageId ?? ""),
    image_en: String(v.imageEn ?? ""),
    image_zn: String(v.imageZn ?? ""),
    url: safeHttpUrl(v.url),
  };
}

function pickServerBanner(json: { success: boolean; data: unknown }): PromoBanner | null {
  if (!json.success || json.data == null || typeof json.data !== "object") return null;
  return normalizePromoBanners([json.data])[0] ?? null;
}

function newLocalId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {}
  return `promo-${Date.now().toString(36)}`;
}

export default function PromoBannersPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const tabLabel = ((a.tabs as unknown as string[])[17] ?? "Promo Banners") as string;
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<PromoBanner>>({ status: "active" });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(f.id);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const counts = [s.products.length, s.productCategories.length, s.masterBrands.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length, 0, 0, s.promoBanners.length];
  // Admin sees ALL statuses — the public endpoint returns active only.
  useEffect(() => {
    if (!gate) return;
    let cancelled = false;
    apiFetch<unknown>(`/admin/promo-banners${buildQuery({ page: 1, limit: 50 })}`)
      .then((json) => {
        if (!cancelled && json.success && Array.isArray(json.data)) {
          s.setPromoBanners(normalizePromoBanners(json.data));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate]);
  const sortedAll = useMemo(() => sortBySortIndex(s.promoBanners as PromoBanner[]), [s.promoBanners]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sortedAll;
    return sortedAll.filter((b) => `${b.name} ${b.id} ${b.description}`.toLowerCase().includes(n));
  }, [sortedAll, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pathFor = (id: string) => `/admin/promo-banners/${encodeURIComponent(id)}`;
  const openAdd = () => { setF({ status: "active", imageId: "", imageEn: "", imageZn: "" }); setFormOpen(true); setErr(null); };
  const openEdit = (b: PromoBanner) => { setF({ ...b, imageId: b.imageId || b.image, imageEn: b.imageEn || b.image, imageZn: b.imageZn || b.image }); setFormOpen(true); setErr(null); };
  const closeForm = () => { setF({ status: "active" }); setFormOpen(false); setErr(null); };

  const toggleStatus = async (id: string) => {
    const item = (s.promoBanners as PromoBanner[]).find((x) => x.id === id);
    if (!item) return;
    const status: PromoBannerStatus = item.status === "active" ? "inactive" : "active";
    const snap = [...s.promoBanners];
    s.setPromoBanners((prev: PromoBanner[]) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await apiFetch(pathFor(id), { method: "PUT", body: JSON.stringify({ status }) });
    } catch (e) {
      const statusCode = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (statusCode && statusCode !== 0 && code !== "NETWORK_ERROR") {
        s.setPromoBanners(snap as PromoBanner[]);
        setErr(e instanceof Error ? e.message : "Toggle failed");
        setTimeout(() => setErr(null), 2500);
      }
      // offline: keep the optimistic local change
    }
  };

  const save = async () => {
    const payload = toPayload(f);
    if (!payload.name || !payload.image) { setErr("Name and at least one image are required."); return; }
    if (f.url?.trim() && !payload.url) { setErr("URL must start with http:// or https://."); return; }
    setSaving(true); setErr(null);
    try {
      if (isEdit) {
        const json = await apiFetch<unknown>(pathFor(f.id!), { method: "PUT", body: JSON.stringify(payload) });
        const updated = { ...pickServerBanner(json), ...payload, id: f.id! } as PromoBanner;
        s.setPromoBanners((prev: PromoBanner[]) => prev.map((x) => (x.id === f.id ? updated : x)));
      } else {
        const json = await apiFetch<unknown>("/admin/promo-banners", { method: "POST", body: JSON.stringify(payload) });
        const serverBanner = pickServerBanner(json);
        const created = { ...serverBanner, ...payload, id: serverBanner?.id ?? newLocalId() } as PromoBanner;
        s.setPromoBanners((prev: PromoBanner[]) => [...prev, created]);
      }
      closeForm();
    } catch (e) {
      const statusCode = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (!statusCode || statusCode === 0 || code === "NETWORK_ERROR") {
        // offline dev fallback — keep local only
        if (isEdit) s.setPromoBanners((prev: PromoBanner[]) => prev.map((x) => (x.id === f.id ? { ...x, ...payload } : x)));
        else s.setPromoBanners((prev: PromoBanner[]) => [...prev, { ...payload, id: newLocalId() }]);
        closeForm();
      } else {
        setErr(e instanceof Error ? e.message : "Save failed");
      }
    } finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    if (!confirmAdminDelete("this promo banner")) return;
    const snap = [...s.promoBanners];
    s.setPromoBanners((prev: PromoBanner[]) => prev.filter((x) => x.id !== id));
    try {
      await apiFetch(pathFor(id), { method: "DELETE" });
    } catch (e) {
      const statusCode = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (statusCode && statusCode !== 0 && code !== "NETWORK_ERROR") {
        s.setPromoBanners(snap as PromoBanner[]);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {tabLabel}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{tabLabel}</h1><p className="mt-1 text-[12px] text-[#8B6F47]">Banner at the top of the education section on Home — only <b>Active</b> banners show. More than 1 active becomes a slider.</p></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.promoBanners.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{isEdit ? a.edit : a.add} — {tabLabel}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {isEdit && <div className="sm:col-span-2"><Field label="id (UUID, assigned by server)"><Input value={f.id ?? ""} disabled readOnly /></Field></div>}
            <div className="sm:col-span-2"><Field label="name"><Input value={f.name ?? ""} maxLength={150} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ramadhan Promo" /></Field></div>
            <div className="sm:col-span-2"><Field label="description"><TextArea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} placeholder="Short promo description shown on the banner caption" /></Field></div>
            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
              <Field label="Banner image (Indonesian)"><FileUpload value={f.imageId ?? ""} onChange={(v) => setF({ ...f, imageId: v })} accept="image/*" folder="promo-banners" maxImageMB={10} /></Field>
              <Field label="Banner image (English)"><FileUpload value={f.imageEn ?? ""} onChange={(v) => setF({ ...f, imageEn: v })} accept="image/*" folder="promo-banners" maxImageMB={10} /></Field>
              <Field label="Banner image (Chinese)"><FileUpload value={f.imageZn ?? ""} onChange={(v) => setF({ ...f, imageZn: v })} accept="image/*" folder="promo-banners" maxImageMB={10} /></Field>
            </div>
            <div className="sm:col-span-2"><Field label="link url (optional — banner image becomes a link)"><Input type="url" inputMode="url" value={f.url ?? ""} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://…" /></Field>{f.url?.trim() && !safeHttpUrl(f.url) && <p className="mt-1 text-[11px] text-red-600">Must start with http:// or https://</p>}</div>
            <Field label="status">
              <div className="flex gap-2">
                {(["active", "inactive"] as PromoBannerStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setF({ ...f, status: st })}
                    className={`flex-1 rounded-full border px-4 py-2 text-[11px] tracking-[0.08em] transition ${f.status === st ? (st === "active" ? "bg-[#2D4A22] text-white border-[#2D4A22]" : "bg-[#8B6F47] text-white border-[#8B6F47]") : "bg-white text-[#2D4A22] border-[#2D4A22]/15 hover:bg-[#2D4A22]/5"}`}
                  >
                    {st === "active" ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.name?.trim() || !(f.image?.trim() || f.imageId?.trim() || f.imageEn?.trim() || f.imageZn?.trim()) || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.promoBanners.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${tabLabel}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[760px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Banner</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-left font-medium">Status</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((b: PromoBanner) => {
                    return (
                      <tr key={b.id}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-[#2D4A22]/10 bg-[#F5EFE0]">
                              {(b.image || b.imageEn || b.imageId || b.imageZn) ? <Image src={b.image || b.imageEn || b.imageId || b.imageZn || ""} alt={b.name} width={160} height={96} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-[10px] text-[#8B6F47]">No image</div>}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#2D4A22]">{b.name}</p>
                              <p className="truncate text-[11px] text-[#8B6F47]">id: {b.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 max-w-[260px]"><p className="line-clamp-2 text-[#1a1a16]/70">{b.description || <span className="text-[#8B6F47]/60">—</span>}</p></td>
                        <td className="px-3 py-2"><button onClick={() => toggleStatus(b.id)} title="Click to toggle status"><StatusBadge status={b.status} /></button></td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(b)} className="rounded-full border px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => remove(b.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
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
