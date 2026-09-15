"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { normalizeSocialMedia, useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { SocialMedia } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete } from "../_components";
import { apiFetch } from "../../lib/api";

// Backend contract (src/routes/socialMedia.js): id is a server-generated UUID,
// create/update accept { name, description, image, instagram, facebook, tiktok }.
const PLATFORM_BASE = { instagram: "https://instagram.com/", facebook: "https://facebook.com/", tiktok: "https://tiktok.com/@" } as const;
type Platform = keyof typeof PLATFORM_BASE;

// Accept "@handle" and "instagram.com/x" so links never resolve relative to /social-media.
function toUrl(platform: Platform, raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("@")) return `${PLATFORM_BASE[platform]}${v.slice(1).replace(/^@/, "")}`;
  return `https://${v.replace(/^\/+/, "")}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `social-${Date.now().toString(36)}`;
}

export default function SocialMediaAdminPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<SocialMedia>>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const tabLabel = (a.tabs as unknown as string[])[13] ?? "Social Media";
  const counts = [s.products.length, s.productCategories.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.socialMedia;
    return s.socialMedia.filter((m) => `${m.name} ${m.description} ${m.instagram} ${m.facebook} ${m.tiktok}`.toLowerCase().includes(n));
  }, [s.socialMedia, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({}); setEditIdx(null); setFormOpen(true); setErr(null); };
  const openEdit = (m: SocialMedia) => { setF({ ...m }); setEditIdx(s.socialMedia.indexOf(m)); setFormOpen(true); setErr(null); };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); };
  const save = async () => {
    const name = String(f.name ?? "").trim();
    if (name.length < 2) { setErr("Name is required (min 2 characters)."); return; }
    const isEdit = editIdx !== null;
    const originalId = isEdit ? s.socialMedia[editIdx!].id : null;
    const payload = {
      name,
      description: String(f.description ?? ""),
      image: String(f.image ?? ""),
      instagram: toUrl("instagram", String(f.instagram ?? "")),
      facebook: toUrl("facebook", String(f.facebook ?? "")),
      tiktok: toUrl("tiktok", String(f.tiktok ?? "")),
    };
    const item: SocialMedia = { id: originalId ?? newId(), ...payload };
    // Sync from the server response so local state always matches server truth
    // (e.g. the UUID the backend assigns on create).
    const fromServer = (data: unknown): SocialMedia => normalizeSocialMedia([data])[0] ?? item;
    setSaving(true); setErr(null);
    try {
      if (isEdit) {
        const json = await apiFetch<SocialMedia>(`/admin/social-media/${encodeURIComponent(originalId!)}`, { method: "PUT", body: JSON.stringify(payload) });
        const saved = json.success && json.data ? fromServer(json.data) : item;
        s.setSocialMedia((prev: SocialMedia[]) => prev.map((x, i) => i === editIdx ? saved : x));
      } else {
        const json = await apiFetch<SocialMedia>("/admin/social-media", { method: "POST", body: JSON.stringify(payload) });
        const saved = json.success && json.data ? fromServer(json.data) : item;
        s.setSocialMedia((prev: SocialMedia[]) => [...prev, saved]);
      }
      closeForm();
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      const msg = e instanceof Error ? e.message : "Save failed";
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit) s.setSocialMedia((prev: SocialMedia[]) => prev.map((x, i) => i === editIdx ? item : x));
        else s.setSocialMedia((prev: SocialMedia[]) => [...prev, item]);
        closeForm();
      } else {
        setErr(msg);
      }
    } finally { setSaving(false); }
  };
  const remove = async (m: SocialMedia) => {
    if (!confirmAdminDelete("this social media entry")) return;
    const realIdx = s.socialMedia.indexOf(m);
    const snap = [...s.socialMedia];
    s.setSocialMedia((prev: SocialMedia[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/social-media/${encodeURIComponent(m.id)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setSocialMedia(snap);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {tabLabel}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{tabLabel}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.socialMedia.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {tabLabel}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="name *"><Input value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Barry Callebaut" /></Field></div>
            {editIdx !== null && <div className="sm:col-span-2"><Field label="id (auto-generated)"><Input value={f.id ?? ""} readOnly className="bg-white/60 text-[#8B6F47]" /></Field></div>}
            <div className="sm:col-span-2"><Field label="description"><TextArea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3} placeholder="Short description shown under the logo" /></Field></div>
            <div className="sm:col-span-2"><Field label="image (logo)"><FileUpload value={f.image ?? ""} onChange={(v) => setF({ ...f, image: v })} accept="image/*" folder="social-media" /></Field></div>
            <Field label="instagram"><Input value={f.instagram ?? ""} onChange={(e) => setF({ ...f, instagram: e.target.value })} placeholder="https://instagram.com/… or @handle" /></Field>
            <Field label="facebook"><Input value={f.facebook ?? ""} onChange={(e) => setF({ ...f, facebook: e.target.value })} placeholder="https://facebook.com/… or @handle" /></Field>
            <div className="sm:col-span-2"><Field label="tiktok"><Input value={f.tiktok ?? ""} onChange={(e) => setF({ ...f, tiktok: e.target.value })} placeholder="https://tiktok.com/@… or @handle" /></Field></div>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!String(f.name ?? "").trim() || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {!String(f.name ?? "").trim() && <p className="mt-2 text-[11px] text-[#8B6F47]">Name required — id is generated by the server.</p>}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.socialMedia.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${tabLabel}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[760px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Preview</th><th className="px-3 py-3 text-left font-medium">Name / ID</th><th className="px-3 py-3 text-left font-medium">Description</th><th className="px-3 py-3 text-left font-medium">Social</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((m: SocialMedia) => {
                    const links = (["instagram", "facebook", "tiktok"] as Platform[]).filter((p) => m[p]);
                    return (
                    <tr key={m.id} className="hover:bg-white/60">
                      <td className="px-3 py-2">
                        {m.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.image} alt={m.name} className="h-10 w-10 rounded-lg object-contain bg-white" />
                        ) : <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F5EFE0] text-[10px] text-[#8B6F47]">—</span>}
                      </td>
                      <td className="px-3 py-2 max-w-[220px]"><div className="truncate font-medium text-[#2D4A22]">{m.name}</div><div className="truncate text-[11px] text-[#8B6F47]">{m.id}</div></td>
                      <td className="px-3 py-2 max-w-[280px]"><div className="truncate text-[#1a1a16]/70" title={m.description}>{m.description || "—"}</div></td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          {links.length === 0 ? <span className="text-[#8B6F47]">—</span> : links.map((p) => (
                            <a key={p} href={m[p]} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#2D4A22]/10 bg-white px-2.5 py-1 text-[10px] text-[#2D4A22] hover:border-[#2D4A22]/30">{p}</a>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(m)} className="rounded-full border bg-white px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => remove(m)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
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
