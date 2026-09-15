"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { normalizeSalesContacts, sortSalesContacts, useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { SalesContact } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE, confirmAdminDelete } from "../_components";
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

function ensureUniqueId(base: string, existing: string[], current?: string | null): string {
  const taken = new Set(existing.filter((s) => s !== current));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "NF";
}

export default function SalesPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [f, setF] = useState<Partial<SalesContact>>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [idTouched, setIdTouched] = useState(false);
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  const tabLabel = (a.tabs as unknown as string[])[12] ?? "Sales";
  const counts = [s.products.length, s.productCategories.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const ordered = useMemo(() => sortSalesContacts(s.salesContacts as SalesContact[]), [s.salesContacts]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return ordered;
    return ordered.filter((c) => `${c.name} ${c.position} ${c.whatsapp} ${c.email} ${c.location}`.toLowerCase().includes(n));
  }, [ordered, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openAdd = () => { setF({ gender: "", published: true }); setEditIdx(null); setFormOpen(true); setErr(null); setIdTouched(false); };
  const openEdit = (c: SalesContact) => {
    const realIdx = (s.salesContacts as SalesContact[]).indexOf(c);
    setF({ ...c }); setEditIdx(realIdx); setFormOpen(true); setErr(null); setIdTouched(true);
  };
  const closeForm = () => { setF({}); setEditIdx(null); setFormOpen(false); setErr(null); setIdTouched(false); };
  const handleNameChange = (name: string) => {
    setF((prev) => ({ ...prev, name, ...(!idTouched ? { id: slugify(name) } : {}) }));
  };
  const handleIdChange = (raw: string) => {
    setIdTouched(true);
    setF((prev) => ({ ...prev, id: slugify(raw) }));
  };
  const save = async () => {
    if (!f.name?.trim()) return;
    const baseId = f.id?.trim() ? slugify(String(f.id)) : slugify(String(f.name));
    if (!baseId) { setErr("Name must contain at least 3 letters/numbers to generate an id."); return; }
    const isEdit = editIdx !== null;
    const originalId = isEdit ? (s.salesContacts as SalesContact[])[editIdx!]?.id : null;
    const id = ensureUniqueId(baseId, (s.salesContacts as SalesContact[]).map((x) => x.id), originalId);
    const published = f.published !== false;
    const item: SalesContact = {
      id,
      name: String(f.name).trim(),
      gender: String(f.gender ?? ""),
      position: String(f.position ?? ""),
      whatsapp: String(f.whatsapp ?? ""),
      email: String(f.email ?? ""),
      photo: String(f.photo ?? ""),
      location: String(f.location ?? ""),
      published,
      isPublished: published,
    };
    // Backend contract: POST/PUT /admin/sales (src/routes/sales.js) accepts
    // isPublished or published alias; send both. Sync local state from the
    // server response so it always matches server truth (e.g. id rename is
    // accepted but not persisted by the backend — local keeps server id).
    const fromServer = (data: unknown): SalesContact => normalizeSalesContacts([data])[0] ?? item;
    setSaving(true); setErr(null);
    try {
      if (isEdit) {
        const json = await apiFetch<SalesContact>(`/admin/sales/${encodeURIComponent(originalId!)}`, { method: "PUT", body: JSON.stringify(item) });
        const saved = json.success && json.data ? fromServer(json.data) : item;
        s.setSalesContacts((prev: SalesContact[]) => prev.map((x, i) => i === editIdx ? saved : x));
      } else {
        const json = await apiFetch<SalesContact>("/admin/sales", { method: "POST", body: JSON.stringify(item) });
        const saved = json.success && json.data ? fromServer(json.data) : item;
        s.setSalesContacts((prev: SalesContact[]) => [...prev, saved]);
      }
      closeForm();
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      const msg = e instanceof Error ? e.message : "Save failed";
      if (!status || status === 0 || code === "NETWORK_ERROR") {
        if (isEdit) s.setSalesContacts((prev: SalesContact[]) => prev.map((x, i) => i === editIdx ? item : x));
        else s.setSalesContacts((prev: SalesContact[]) => [...prev, item]);
        closeForm();
      } else {
        if (code === "CONFLICT") setErr("ID already exists (409 CONFLICT)");
        else setErr(msg);
      }
    } finally { setSaving(false); }
  };
  const remove = async (c: SalesContact) => {
    if (!confirmAdminDelete("this sales contact")) return;
    const realIdx = (s.salesContacts as SalesContact[]).indexOf(c);
    const snap = [...s.salesContacts];
    s.setSalesContacts((prev: SalesContact[]) => prev.filter((_, idx) => idx !== realIdx));
    try {
      await apiFetch(`/admin/sales/${encodeURIComponent(c.id)}`, { method: "DELETE" });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        s.setSalesContacts(snap as SalesContact[]);
        setErr(e instanceof Error ? e.message : "Delete failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  const togglePublished = async (c: SalesContact) => {
    const realIdx = (s.salesContacts as SalesContact[]).indexOf(c);
    const published = !(c.published !== false);
    const next = { ...c, published, isPublished: published };
    s.setSalesContacts((prev: SalesContact[]) => prev.map((x, i) => i === realIdx ? next : x));
    try {
      // Dedicated contract endpoint (src/routes/sales.js) — accepts
      // { isPublished } or { published } alias.
      await apiFetch(`/admin/sales/${encodeURIComponent(c.id)}/publish`, { method: "PATCH", body: JSON.stringify({ isPublished: published }) });
    } catch (e) {
      const status = (e as { status?: number })?.status;
      const code = (e as { code?: string })?.code;
      if (status && status !== 0 && code !== "NETWORK_ERROR") {
        // revert on real error (offline keeps optimistic change)
        s.setSalesContacts((prev: SalesContact[]) => prev.map((x, i) => i === realIdx ? c : x));
        setErr(e instanceof Error ? e.message : "Publish toggle failed");
        setTimeout(() => setErr(null), 2500);
      }
    }
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {tabLabel}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{tabLabel}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">{filtered.length}/{s.salesContacts.length}</span></div>
      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {formOpen ? (
        <Card className="mt-4 p-4 sm:p-6">
          <div className="flex items-center justify-between"><h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{editIdx !== null ? a.edit : a.add} — {tabLabel}</h3><button onClick={closeForm} className="rounded-full border px-3 py-1 text-[11px]">✕ Close</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="name *"><Input value={f.name ?? ""} onChange={(e) => handleNameChange(e.target.value)} placeholder="Andi Wijaya" /></Field>
            <Field label="id (auto from name — editable)"><Input value={f.id ?? ""} onChange={(e) => handleIdChange(e.target.value)} placeholder="andi-wijaya" /></Field>
            <Field label="position"><Input value={f.position ?? ""} onChange={(e) => setF({ ...f, position: e.target.value })} placeholder="Sales — HORECA" /></Field>
            <Field label="gender">
              <select value={f.gender ?? ""} onChange={(e) => setF({ ...f, gender: e.target.value })} className="w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3 py-2 text-[13px] text-[#1a1a16] outline-none focus:border-[#2D4A22]/40">
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="whatsapp"><Input value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} placeholder="+62 812-3456-7890" /></Field>
            <Field label="email"><Input type="email" value={f.email ?? ""} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="sales@naturafoods.id" /></Field>
            <div className="sm:col-span-2"><Field label="location"><Input value={f.location ?? ""} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Jakarta" /></Field></div>
            <div className="sm:col-span-2"><Field label="photo"><FileUpload value={f.photo ?? ""} onChange={(v) => setF({ ...f, photo: v })} accept="image/*" folder="sales" /></Field></div>
            <label className="flex items-center gap-2 text-[12px] text-[#2D4A22]"><input type="checkbox" checked={f.published !== false} onChange={(e) => setF({ ...f, published: e.target.checked })} className="h-4 w-4 accent-[#2D4A22]" /> Published (shown on site)</label>
          </div>
          <div className="mt-4 flex gap-2"><button onClick={save} disabled={!f.name?.trim() || saving} className="rounded-full bg-[#2D4A22] px-6 py-2.5 text-[11px] text-white disabled:opacity-50">{saving ? "Saving…" : a.save}</button><button onClick={closeForm} disabled={saving} className="rounded-full border px-6 py-2.5 text-[11px]">{a.cancel}</button></div>
          {!f.name?.trim() && <p className="mt-2 text-[11px] text-[#8B6F47]">Name required — id is generated automatically.</p>}
        </Card>
      ) : (
        <div className="mt-4 grid gap-3">
          <Toolbar q={q} setQ={setQ} total={s.salesContacts.length} filtered={filtered.length} onAdd={openAdd} addLabel={`${a.add} ${tabLabel}`} />
          {filtered.length === 0 ? <Empty msg={a.noData} /> : (
            <TableWrap>
              <table className="w-full min-w-[820px] text-[12px]">
                <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Contact</th><th className="px-3 py-3 text-left font-medium">Position</th><th className="px-3 py-3 text-left font-medium">WhatsApp</th><th className="px-3 py-3 text-left font-medium">Email</th><th className="px-3 py-3 text-left font-medium">Location</th><th className="px-3 py-3 text-left font-medium">Status</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#2D4A22]/10">
                  {paged.map((c: SalesContact) => {
                    const photo = c.photo?.trim() ? c.photo : null;
                    return (
                      <tr key={c.id} className="hover:bg-white/60">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photo} alt={c.name} className="h-10 w-10 rounded-full object-cover bg-[#F5EFE0]" />
                            ) : (
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2D4A22] text-[11px] font-medium tracking-[0.08em] text-white">{initials(c.name)}</span>
                            )}
                            <div className="min-w-0"><p className="truncate font-medium text-[#2D4A22]">{c.name}</p><p className="truncate text-[11px] text-[#8B6F47]">{c.id}{c.gender ? ` · ${c.gender}` : ""}</p></div>
                          </div>
                        </td>
                        <td className="px-3 py-2">{c.position || <span className="text-[#8B6F47]">—</span>}</td>
                        <td className="px-3 py-2">{c.whatsapp || <span className="text-[#8B6F47]">—</span>}</td>
                        <td className="px-3 py-2 max-w-[220px] truncate text-[#2D4A22]/80">{c.email || <span className="text-[#8B6F47]">—</span>}</td>
                        <td className="px-3 py-2">{c.location || <span className="text-[#8B6F47]">—</span>}</td>
                        <td className="px-3 py-2"><button onClick={() => togglePublished(c)} title="Toggle published" className={`rounded-full border px-2.5 py-1 text-[11px] ${c.published !== false ? "border-[#2D4A22]/20 bg-[#E8F0E2] text-[#2D4A22]" : "border-[#2D4A22]/10 bg-white text-[#8B6F47]"}`}>{c.published !== false ? "Published" : "Hidden"}</button></td>
                        <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => openEdit(c)} className="rounded-full border bg-white px-3 py-1 text-[11px]">{a.edit}</button><button onClick={() => remove(c)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{a.delete}</button></div></td>
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
