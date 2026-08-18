"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import type { Article, Edu, Innovation, Job, Product } from "../../lib/data";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea } from "../_components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [tab, setTab] = useState(0);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  if (!gate) return <div className="min-h-screen bg-[#FFFCF2] grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;

  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length];

  return (
    <AdminShell active={tab} onTab={(i) => { setTab(i); setEditIdx(null); }} counts={counts} labels={a.tabs as unknown as string[]}>
      {/* page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {a.tabs[tab]}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-[26px] font-light leading-none text-[#2D4A22] sm:text-[30px]">{a.dashTitle}</h1>
          <p className="mt-2 max-w-[60ch] text-[12px] leading-5 text-[#1a1a16]/60">Manage catalog & content. Edits persist in localStorage — reset restores seed data.</p>
        </div>
        <button onClick={() => { if (confirm(a.resetConfirm)) s.reset(); }} className="self-start rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5 sm:self-auto">{a.reset}</button>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { k: a.tabs[0], v: s.products.length, sub: "catalog" },
          { k: a.tabs[1], v: s.articles.length, sub: "published" },
          { k: a.tabs[2], v: s.edu.length, sub: "classes" },
          { k: a.tabs[3], v: s.innovation.length, sub: "pilots" },
          { k: a.tabs[4], v: s.jobs.length, sub: "open roles" },
          { k: a.tabs[5], v: s.inquiries.length, sub: "leads" },
        ].map((stat) => (
          <div key={stat.k} className="rounded-2xl bg-white border border-[#2D4A22]/10 p-4">
            <p className="text-[10px] tracking-[0.14em] text-[#8B6F47]">{stat.k.toUpperCase()}</p>
            <p className="mt-1 font-[var(--font-display)] text-[22px] font-light text-[#2D4A22]">{stat.v}</p>
            <p className="text-[11px] text-[#8B6F47]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* content */}
      <div className="mt-6">
        {tab === 0 && <ProductsTab s={s} a={a} editIdx={editIdx} setEditIdx={setEditIdx} />}
        {tab === 1 && <ArticlesTab s={s} a={a} editIdx={editIdx} setEditIdx={setEditIdx} />}
        {tab === 2 && <EduTab s={s} a={a} editIdx={editIdx} setEditIdx={setEditIdx} />}
        {tab === 3 && <InnovationTab s={s} a={a} editIdx={editIdx} setEditIdx={setEditIdx} />}
        {tab === 4 && <JobsTab s={s} a={a} editIdx={editIdx} setEditIdx={setEditIdx} />}
        {tab === 5 && <InquiriesTab s={s} a={a} />}
      </div>
    </AdminShell>
  );
}

/* — shared helpers — */
function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">{title}</h3>
      {typeof count === "number" && <span className="rounded-full bg-[#FFFCF2] border border-[#2D4A22]/10 px-2.5 py-1 text-[11px] text-[#8B6F47]">{count} items</span>}
    </div>
  );
}
function Empty({ msg }: { msg: string }) {
  return <div className="rounded-2xl border border-dashed border-[#2D4A22]/15 bg-white/60 p-8 text-center text-[13px] text-[#8B6F47]">{msg}</div>;
}

/* — Products — */
function ProductsTab({ s, a, editIdx, setEditIdx }: any) {
  const [f, setF] = useState<Partial<Product>>({});
  const [q, setQ] = useState("");
  const startEdit = (i: number) => { setF(s.products[i]); setEditIdx(i); };
  const save = () => {
    if (!f.title || !f.slug) return;
    const item: Product = { slug: String(f.slug), cat: (f.cat as any) ?? "choco", title: String(f.title), note: String(f.note ?? ""), tag: String(f.tag ?? ""), img: String(f.img ?? ""), desc: String(f.desc ?? "") };
    if (editIdx !== null) s.setProducts((prev: Product[]) => prev.map((x: Product, i: number) => i === editIdx ? item : x));
    else s.setProducts((prev: Product[]) => [...prev, item]);
    setF({}); setEditIdx(null);
  };
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return s.products as Product[];
    return (s.products as Product[]).filter((p: Product) => `${p.title} ${p.slug} ${p.cat}`.toLowerCase().includes(needle));
  }, [s.products, q]);
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="p-4 sm:p-5 h-fit lg:sticky lg:top-[72px]">
        <SectionTitle title={`${editIdx !== null ? a.edit : a.add} — ${a.tabs[0]}`} />
        <div className="mt-4 grid gap-3">
          <Field label="slug"><Input value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="belgian-dark-72" /></Field>
          <Field label="category"><Select value={f.cat ?? "choco"} onValueChange={(v) => setF({ ...f, cat: v as any })}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="choco">choco</SelectItem><SelectItem value="matcha">matcha</SelectItem></SelectContent></Select></Field>
          <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Belgian Dark 72%" /></Field>
          <Field label="note"><Input value={f.note ?? ""} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Callets · Single origin" /></Field>
          <Field label="tag"><Input value={f.tag ?? ""} onChange={(e) => setF({ ...f, tag: e.target.value })} placeholder="Bulk · 2.5kg" /></Field>
          <Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" /></Field>
          <Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={3} placeholder="Short description" /></Field>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={save} className="rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317] disabled:opacity-50" disabled={!f.title || !f.slug}>{a.save}</button>
            {editIdx !== null && <button onClick={() => { setF({}); setEditIdx(null); }} className="rounded-full border border-[#2D4A22]/15 bg-white px-5 py-2.5 text-[11px] tracking-[0.12em] text-[#2D4A22]">{a.cancel}</button>}
          </div>
          {(!f.title || !f.slug) && <p className="text-[11px] text-[#8B6F47]">Title & slug required.</p>}
        </div>
      </Card>
      <div className="grid gap-3">
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="rounded-full" />
          <span className="hidden sm:inline-flex items-center rounded-full bg-white border border-[#2D4A22]/10 px-4 text-[11px] text-[#8B6F47] shrink-0">{filtered.length}/{s.products.length}</span>
        </div>
        {filtered.length === 0 && <Empty msg={a.noData} />}
        {filtered.map((p: Product) => {
          const realIdx = (s.products as Product[]).indexOf(p);
          const isVideo = p.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(p.img ?? "");
          return (
            <Card key={p.slug + realIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:shadow-[0_4px_16px_rgba(26,26,22,0.06)] transition">
              <div className="flex gap-3 items-center min-w-0">
                {isVideo ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={p.img} className="h-12 w-12 rounded-xl object-cover bg-[#F5EFE0] shrink-0" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.img} alt="" className="h-12 w-12 rounded-xl object-cover bg-[#F5EFE0] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#2D4A22] truncate">{p.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] tracking-[0.08em] border ${p.cat === "matcha" ? "bg-[#E8F0E4] border-[#2D4A22]/15 text-[#2D4A22]" : "bg-[#FFF1D6] border-[#8B6F47]/15 text-[#8B6F47]"}`}>{p.cat}</span>
                    <span className="text-[11px] text-[#8B6F47] truncate">{p.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 self-start sm:self-center">
                <button onClick={() => startEdit(realIdx)} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-1.5 text-[11px] hover:bg-[#FFFCF2]">{a.edit}</button>
                <button onClick={() => s.setProducts((prev: Product[]) => prev.filter((_: Product, idx: number) => idx !== realIdx))} className="rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[11px] text-red-700 hover:bg-red-100">{a.delete}</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ArticlesTab({ s, a, editIdx, setEditIdx }: any) {
  const [f, setF] = useState<Partial<Article>>({});
  const [q, setQ] = useState("");
  const startEdit = (i: number) => { setF(s.articles[i]); setEditIdx(i); };
  const save = () => {
    if (!f.title || !f.slug) return;
    const item: Article = { slug: String(f.slug), title: String(f.title), excerpt: String(f.excerpt ?? ""), content: String(f.content ?? ""), date: String(f.date ?? new Date().toISOString().slice(0, 10)), category: String(f.category ?? "General"), img: String(f.img ?? "") };
    if (editIdx !== null) s.setArticles((prev: Article[]) => prev.map((x: Article, i: number) => i === editIdx ? item : x)); else s.setArticles((prev: Article[]) => [...prev, item]);
    setF({}); setEditIdx(null);
  };
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return s.articles as Article[];
    return (s.articles as Article[]).filter((x: Article) => `${x.title} ${x.slug} ${x.category}`.toLowerCase().includes(n));
  }, [s.articles, q]);
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="p-4 sm:p-5 h-fit lg:sticky lg:top-[72px]">
        <SectionTitle title={`${editIdx !== null ? a.edit : a.add} — ${a.tabs[1]}`} />
        <div className="mt-4 grid gap-3">
          <Field label="slug"><Input value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="tempering-guide" /></Field>
          <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="How to temper couverture" /></Field>
          <Field label="category"><Input value={f.category ?? ""} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Guide" /></Field>
          <Field label="date"><Input type="date" value={f.date ?? ""} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="YYYY-MM-DD" /></Field>
          <Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" /></Field>
          <Field label="excerpt"><TextArea value={f.excerpt ?? ""} onChange={(e) => setF({ ...f, excerpt: e.target.value })} rows={2} placeholder="Short summary for listing" /></Field>
          <Field label="content (HTML)"><TextArea value={f.content ?? ""} onChange={(e) => setF({ ...f, content: e.target.value })} rows={5} placeholder="<p>Article HTML content…</p>" /></Field>
          <div className="flex flex-wrap gap-2 pt-1"><button onClick={save} disabled={!f.title || !f.slug} className="rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.12em] text-white disabled:opacity-50">{a.save}</button>{editIdx !== null && <button onClick={() => { setF({}); setEditIdx(null); }} className="rounded-full border border-[#2D4A22]/15 px-5 py-2.5 text-[11px]">{a.cancel}</button>}</div>
        </div>
      </Card>
      <div className="grid gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="rounded-full" />
        {filtered.length === 0 && <Empty msg={a.noData} />}
        {filtered.map((ar: Article) => {
          const realIdx = (s.articles as Article[]).indexOf(ar);
          const isVideo = ar.img?.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(ar.img ?? "");
          return (
            <Card key={ar.slug + realIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div className="flex gap-3 items-center min-w-0">
                {isVideo ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={ar.img} className="h-12 w-12 shrink-0 rounded-xl object-cover bg-[#F5EFE0]" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ar.img} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover bg-[#F5EFE0]" />
                )}
                <div className="min-w-0"><div className="text-[13px] font-medium text-[#2D4A22] truncate">{ar.title}</div><div className="text-[11px] text-[#8B6F47] truncate">{ar.slug} · {ar.date} · {ar.category}</div></div>
              </div>
              <div className="flex gap-2 shrink-0 self-start sm:self-center"><button onClick={() => startEdit(realIdx)} className="rounded-full border border-[#2D4A22]/15 px-4 py-1.5 text-[11px]">{a.edit}</button><button onClick={() => s.setArticles((prev: Article[]) => prev.filter((_: Article, idx: number) => idx !== realIdx))} className="rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[11px] text-red-700">{a.delete}</button></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function EduTab({ s, a, editIdx, setEditIdx }: any) {
  const [f, setF] = useState<Partial<Edu>>({});
  const startEdit = (i: number) => { setF(s.edu[i]); setEditIdx(i); };
  const save = () => {
    if (!f.title) return;
    const item: Edu = { id: String(f.id ?? Date.now().toString()), title: String(f.title), desc: String(f.desc ?? ""), duration: String(f.duration ?? ""), level: String(f.level ?? ""), img: String(f.img ?? ""), link: String(f.link ?? ""), cta: String(f.cta ?? ""), eyebrow: String(f.eyebrow ?? "") };
    if (editIdx !== null) s.setEdu((prev: Edu[]) => prev.map((x: Edu, i: number) => i === editIdx ? item : x)); else s.setEdu((prev: Edu[]) => [...prev, item]);
    setF({}); setEditIdx(null);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="p-4 sm:p-5 h-fit lg:sticky lg:top-[72px]">
        <SectionTitle title={`${editIdx !== null ? a.edit : a.add} — ${a.tabs[2]}`} />
        <div className="mt-4 grid gap-3">
          <Field label="id"><Input value={f.id ?? ""} onChange={(e) => setF({ ...f, id: e.target.value })} placeholder="edu-001" /></Field>
          <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Barista Matcha Essentials" /></Field>
          <Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={2} placeholder="Workshop description…" /></Field>
          <Field label="duration"><Input value={f.duration ?? ""} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="1 day · Jakarta" /></Field>
          <Field label="level"><Input value={f.level ?? ""} onChange={(e) => setF({ ...f, level: e.target.value })} placeholder="Beginner" /></Field>
          <Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" /></Field>
          <Field label="eyebrow"><Input value={f.eyebrow ?? ""} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} placeholder="EDUCATION · WORKSHOP" /></Field>
          <Field label="link (youtube / any url)"><Input value={f.link ?? ""} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></Field>
          <Field label="cta label"><Input value={f.cta ?? ""} onChange={(e) => setF({ ...f, cta: e.target.value })} placeholder="Watch on YouTube" /></Field>
          <div className="flex gap-2 pt-1"><button onClick={save} disabled={!f.title} className="rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.12em] text-white disabled:opacity-50">{a.save}</button>{editIdx !== null && <button onClick={() => { setF({}); setEditIdx(null); }} className="rounded-full border border-[#2D4A22]/15 px-5 py-2.5 text-[11px]">{a.cancel}</button>}</div>
        </div>
      </Card>
      <div className="grid gap-3">
        <SectionTitle title="Classes" count={s.edu.length} />
        {s.edu.length === 0 && <Empty msg={a.noData} />}
        {s.edu.map((e: Edu, i: number) => (
          <Card key={e.id + i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="min-w-0"><div className="text-[13px] font-medium text-[#2D4A22] truncate">{e.title}</div><div className="text-[11px] text-[#8B6F47]">{e.level} · {e.duration}</div></div>
            <div className="flex gap-2 shrink-0"><button onClick={() => startEdit(i)} className="rounded-full border border-[#2D4A22]/15 px-4 py-1.5 text-[11px]">{a.edit}</button><button onClick={() => s.setEdu((prev: Edu[]) => prev.filter((_: Edu, idx: number) => idx !== i))} className="rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[11px] text-red-700">{a.delete}</button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InnovationTab({ s, a, editIdx, setEditIdx }: any) {
  const [f, setF] = useState<Partial<Innovation>>({});
  const startEdit = (i: number) => { setF(s.innovation[i]); setEditIdx(i); };
  const save = () => {
    if (!f.title) return;
    const item: Innovation = { id: String(f.id ?? Date.now().toString()), title: String(f.title), desc: String(f.desc ?? ""), tag: String(f.tag ?? ""), img: String(f.img ?? ""), link: String(f.link ?? ""), cta: String(f.cta ?? ""), eyebrow: String(f.eyebrow ?? "") };
    if (editIdx !== null) s.setInnovation((prev: Innovation[]) => prev.map((x: Innovation, i: number) => i === editIdx ? item : x)); else s.setInnovation((prev: Innovation[]) => [...prev, item]);
    setF({}); setEditIdx(null);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="p-4 sm:p-5 h-fit lg:sticky lg:top-[72px]">
        <SectionTitle title={`${editIdx !== null ? a.edit : a.add} — ${a.tabs[3]}`} />
        <div className="mt-4 grid gap-3">
          <Field label="id"><Input value={f.id ?? ""} onChange={(e) => setF({ ...f, id: e.target.value })} placeholder="innov-001" /></Field>
          <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Nusantara Single-Origin" /></Field>
          <Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={2} placeholder="Innovation description…" /></Field>
          <Field label="tag"><Input value={f.tag ?? ""} onChange={(e) => setF({ ...f, tag: e.target.value })} placeholder="R&D Pilot" /></Field>
          <Field label="image / video"><FileUpload value={f.img ?? ""} onChange={(v) => setF({ ...f, img: v })} accept="image/*,video/*" /></Field>
          <Field label="eyebrow"><Input value={f.eyebrow ?? ""} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} placeholder="INNOVATION · R&D" /></Field>
          <Field label="link (youtube / any url)"><Input value={f.link ?? ""} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></Field>
          <Field label="cta label"><Input value={f.cta ?? ""} onChange={(e) => setF({ ...f, cta: e.target.value })} placeholder="Watch film" /></Field>
          <div className="flex gap-2 pt-1"><button onClick={save} disabled={!f.title} className="rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.12em] text-white disabled:opacity-50">{a.save}</button>{editIdx !== null && <button onClick={() => { setF({}); setEditIdx(null); }} className="rounded-full border border-[#2D4A22]/15 px-5 py-2.5 text-[11px]">{a.cancel}</button>}</div>
        </div>
      </Card>
      <div className="grid gap-3">
        {s.innovation.length === 0 && <Empty msg={a.noData} />}
        {s.innovation.map((it: Innovation, i: number) => (
          <Card key={it.id + i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div><div className="text-[13px] font-medium text-[#2D4A22]">{it.title}</div><div className="text-[11px] text-[#8B6F47]">{it.tag}</div></div>
            <div className="flex gap-2 shrink-0"><button onClick={() => startEdit(i)} className="rounded-full border border-[#2D4A22]/15 px-4 py-1.5 text-[11px]">{a.edit}</button><button onClick={() => s.setInnovation((prev: Innovation[]) => prev.filter((_: Innovation, idx: number) => idx !== i))} className="rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[11px] text-red-700">{a.delete}</button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function JobsTab({ s, a, editIdx, setEditIdx }: any) {
  const [f, setF] = useState<Partial<Job>>({});
  const startEdit = (i: number) => { setF(s.jobs[i]); setEditIdx(i); };
  const save = () => {
    if (!f.title) return;
    const item: Job = { id: String(f.id ?? Date.now().toString()), title: String(f.title), dept: String(f.dept ?? ""), loc: String(f.loc ?? ""), type: String(f.type ?? "Full-time"), desc: String(f.desc ?? "") };
    if (editIdx !== null) s.setJobs((prev: Job[]) => prev.map((x: Job, i: number) => i === editIdx ? item : x)); else s.setJobs((prev: Job[]) => [...prev, item]);
    setF({}); setEditIdx(null);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="p-4 sm:p-5 h-fit lg:sticky lg:top-[72px]">
        <SectionTitle title={`${editIdx !== null ? a.edit : a.add} — ${a.tabs[4]}`} />
        <div className="mt-4 grid gap-3">
          <Field label="id"><Input value={f.id ?? ""} onChange={(e) => setF({ ...f, id: e.target.value })} placeholder="job-001" /></Field>
          <Field label="title"><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Sales Manager — HORECA" /></Field>
          <Field label="dept"><Input value={f.dept ?? ""} onChange={(e) => setF({ ...f, dept: e.target.value })} placeholder="Sales" /></Field>
          <Field label="location"><Input value={f.loc ?? ""} onChange={(e) => setF({ ...f, loc: e.target.value })} placeholder="Jakarta" /></Field>
          <Field label="type"><Input value={f.type ?? ""} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder="Full-time" /></Field>
          <Field label="desc"><TextArea value={f.desc ?? ""} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={3} placeholder="Role description…" /></Field>
          <div className="flex gap-2 pt-1"><button onClick={save} disabled={!f.title} className="rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] tracking-[0.12em] text-white disabled:opacity-50">{a.save}</button>{editIdx !== null && <button onClick={() => { setF({}); setEditIdx(null); }} className="rounded-full border border-[#2D4A22]/15 px-5 py-2.5 text-[11px]">{a.cancel}</button>}</div>
        </div>
      </Card>
      <div className="grid gap-3">
        {s.jobs.length === 0 && <Empty msg={a.noData} />}
        {s.jobs.map((j: Job, i: number) => (
          <Card key={j.id + i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div><div className="text-[13px] font-medium text-[#2D4A22]">{j.title}</div><div className="text-[11px] text-[#8B6F47]">{j.dept} · {j.loc} · {j.type}</div></div>
            <div className="flex gap-2 shrink-0"><button onClick={() => startEdit(i)} className="rounded-full border border-[#2D4A22]/15 px-4 py-1.5 text-[11px]">{a.edit}</button><button onClick={() => s.setJobs((prev: Job[]) => prev.filter((_: Job, idx: number) => idx !== i))} className="rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[11px] text-red-700">{a.delete}</button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InquiriesTab({ s, a }: any) {
  if (s.inquiries.length === 0) return <Card className="p-8 text-center text-[13px] text-[#8B6F47]">{a.noData}</Card>;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D4A22]/10">
        <p className="text-[11px] tracking-[0.14em] text-[#2D4A22]">INQUIRIES</p>
        <span className="rounded-full bg-[#2D4A22] text-white px-3 py-1 text-[11px]">{s.inquiries.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12px]">
          <thead className="bg-[#FFFCF2] text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="text-left px-4 py-3 font-medium">Name</th><th className="text-left px-4 py-3 font-medium">City</th><th className="text-left px-4 py-3 font-medium">WhatsApp</th><th className="text-left px-4 py-3 font-medium">Interest</th><th className="text-left px-4 py-3 font-medium">Date</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-[#2D4A22]/10">
            {s.inquiries.map((q: any, i: number) => (
              <tr key={q.id} className="hover:bg-[#FFFCF2]/60"><td className="px-4 py-3 font-medium text-[#2D4A22]">{q.name}</td><td className="px-4 py-3 text-[#1a1a16]/70">{q.city}</td><td className="px-4 py-3">{q.whatsapp}</td><td className="px-4 py-3"><span className="rounded-full bg-[#2D4A22]/10 px-2.5 py-1 text-[11px] text-[#2D4A22]">{q.interest}</span></td><td className="px-4 py-3 text-[#8B6F47]">{new Date(q.date).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><button onClick={() => s.setInquiries((prev: any[]) => prev.filter((_: any, idx: number) => idx !== i))} className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] text-red-700 hover:bg-red-100">{a.delete}</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
