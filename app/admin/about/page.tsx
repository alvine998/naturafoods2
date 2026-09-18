"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dict, locales, useLang, type Locale } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea } from "../_components";
import { deepGet, deepSet, deleteLocaleOverrides, fetchSiteContent, loadRaw, saveLocaleContent, saveRaw } from "../../lib/siteContent";

// The About page (app/about/page.tsx) renders everything from `dict[locale].aboutDetail`,
// plus two shared lists that also appear on the home page (aboutBadges, marquee).
// Overrides are stored per language via PUT /admin/site-content/:locale.
const ABOUT = "aboutDetail";

type Ctx = {
  get: (path: string[]) => unknown;
  def: (path: string[]) => unknown;
  overridden: (path: string[]) => boolean;
  set: (path: string[], value: unknown) => void;
  clear: (path: string[]) => void;
};

const SECTIONS = [
  { id: "hero", label: "Hero video" },
  { id: "intro", label: "Intro" },
  { id: "story", label: "Story" },
  { id: "journey", label: "Journey" },
  { id: "chain", label: "Supply chain" },
  { id: "values", label: "Vision & mission" },
  { id: "origins", label: "Categories" },
  { id: "warehouse", label: "Warehouse" },
  { id: "cta", label: "CTA" },
  { id: "shared", label: "Badges & marquee" },
];

function deletePath(obj: Record<string, unknown>, path: string[]): Record<string, unknown> {
  if (path.length === 0) return obj;
  const clone: Record<string, unknown> = { ...obj };
  let cur = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const next = cur[k];
    if (!next || typeof next !== "object" || Array.isArray(next)) return clone;
    const copy = { ...(next as Record<string, unknown>) };
    cur[k] = copy;
    cur = copy;
  }
  delete cur[path[path.length - 1]];
  return clone;
}

// Empty text means "use the language default", so drop it before saving.
function pruneEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === "") continue;
    out[k] = v && typeof v === "object" && !Array.isArray(v) ? pruneEmpty(v as Record<string, unknown>) : v;
  }
  return out;
}

function ResetButton({ show, onReset }: { show: boolean; onReset: () => void }) {
  if (!show) return null;
  return (
    <button type="button" onClick={onReset} className="mt-1 text-[10px] tracking-[0.08em] text-[#8B6F47] underline underline-offset-2 hover:text-[#2D4A22]">
      Reset to default
    </button>
  );
}

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-4">
      <Card className="p-4 sm:p-5">
        <div>
          <h2 className="font-[var(--font-display)] text-[15px] font-light text-[#2D4A22]">{title}</h2>
          {desc && <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">{desc}</p>}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
      </Card>
    </div>
  );
}

function TextRow({ ctx, path, label, multiline = false, span = false }: { ctx: Ctx; path: string[]; label: string; multiline?: boolean; span?: boolean }) {
  const value = String(ctx.get(path) ?? "");
  const def = String(ctx.def(path) ?? "");
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <Field label={label}>
        {multiline ? (
          <TextArea value={value} onChange={(e) => ctx.set(path, e.target.value)} rows={3} placeholder={def} />
        ) : (
          <Input value={value} onChange={(e) => ctx.set(path, e.target.value)} placeholder={def} />
        )}
      </Field>
      <ResetButton show={ctx.overridden(path)} onReset={() => ctx.clear(path)} />
    </div>
  );
}

function MediaRow({ ctx, path, label, accept, folder = "about", span = false }: { ctx: Ctx; path: string[]; label: string; accept?: string; folder?: string; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <Field label={label}>
        <FileUpload value={String(ctx.get(path) ?? "")} onChange={(v) => ctx.set(path, v)} accept={accept} folder={folder} />
      </Field>
      <ResetButton show={ctx.overridden(path)} onReset={() => ctx.clear(path)} />
    </div>
  );
}

function StringList({ ctx, path, label }: { ctx: Ctx; path: string[]; label: string }) {
  const raw = ctx.get(path);
  const list = Array.isArray(raw) ? (raw as string[]) : [];
  const update = (next: string[]) => ctx.set(path, next);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  return (
    <div className="sm:col-span-2 rounded-2xl border border-[#2D4A22]/10 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium tracking-[0.08em] text-[#2D4A22]">{label}</span>
        <div className="flex items-center gap-2">
          <ResetButton show={ctx.overridden(path)} onReset={() => ctx.clear(path)} />
          <button type="button" onClick={() => update([...list, ""])} className="rounded-full border border-[#2D4A22]/15 bg-white px-3 py-1 text-[10px] tracking-[0.08em] text-[#2D4A22] hover:bg-[#2D4A22]/5">
            + Add item
          </button>
        </div>
      </div>
      <div className="mt-2 grid gap-2">
        {list.length === 0 && <p className="text-[11px] text-[#8B6F47]">Empty list — clears this list on the page once saved.</p>}
        {list.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input value={v} onChange={(e) => update(list.map((x, j) => (j === i ? e.target.value : x)))} className="flex-1" />
            <div className="flex shrink-0 gap-1">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="h-7 w-7 rounded-full border border-[#2D4A22]/15 bg-white text-[11px] text-[#2D4A22] disabled:opacity-40">↑</button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="h-7 w-7 rounded-full border border-[#2D4A22]/15 bg-white text-[11px] text-[#2D4A22] disabled:opacity-40">↓</button>
              <button type="button" aria-label="Remove item" onClick={() => update(list.filter((_, j) => j !== i))} className="h-7 w-7 rounded-full border border-red-200 bg-red-50 text-[11px] text-red-700">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ObjField = { key: string; label: string; multiline?: boolean; image?: boolean };

function ObjectList({ ctx, path, label, fields }: { ctx: Ctx; path: string[]; label: string; fields: ObjField[] }) {
  const raw = ctx.get(path);
  const list = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  const update = (next: Record<string, unknown>[]) => ctx.set(path, next);
  const setField = (i: number, key: string, v: string) => update(list.map((item, j) => (j === i ? { ...item, [key]: v } : item)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  return (
    <div className="sm:col-span-2 rounded-2xl border border-[#2D4A22]/10 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium tracking-[0.08em] text-[#2D4A22]">{label}</span>
        <div className="flex items-center gap-2">
          <ResetButton show={ctx.overridden(path)} onReset={() => ctx.clear(path)} />
          <button type="button" onClick={() => update([...list, {}])} className="rounded-full border border-[#2D4A22]/15 bg-white px-3 py-1 text-[10px] tracking-[0.08em] text-[#2D4A22] hover:bg-[#2D4A22]/5">
            + Add item
          </button>
        </div>
      </div>
      <div className="mt-2 grid gap-2">
        {list.length === 0 && <p className="text-[11px] text-[#8B6F47]">Empty list — clears this section on the page once saved.</p>}
        {list.map((item, i) => (
          <div key={i} className="rounded-xl border border-[#2D4A22]/10 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] tracking-[0.12em] text-[#8B6F47]">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="h-7 w-7 rounded-full border border-[#2D4A22]/15 bg-white text-[11px] text-[#2D4A22] disabled:opacity-40">↑</button>
                <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="h-7 w-7 rounded-full border border-[#2D4A22]/15 bg-white text-[11px] text-[#2D4A22] disabled:opacity-40">↓</button>
                <button type="button" aria-label="Remove item" onClick={() => update(list.filter((_, j) => j !== i))} className="h-7 w-7 rounded-full border border-red-200 bg-red-50 text-[11px] text-red-700">✕</button>
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.multiline || f.image ? "sm:col-span-2" : ""}>
                  <Field label={f.label}>
                    {f.image ? (
                      <FileUpload value={String(item[f.key] ?? "")} onChange={(v) => setField(i, f.key, v)} folder="about" />
                    ) : f.multiline ? (
                      <TextArea value={String(item[f.key] ?? "")} onChange={(e) => setField(i, f.key, e.target.value)} rows={2} />
                    ) : (
                      <Input value={String(item[f.key] ?? "")} onChange={(e) => setField(i, f.key, e.target.value)} />
                    )}
                  </Field>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutContentAdminPage() {
  const router = useRouter();
  const { t, locale } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [editLocale, setEditLocale] = useState<Locale>(locale);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  useEffect(() => {
    setDraft(loadRaw());
    fetchSiteContent().then((data) => {
      if (data && Object.keys(data).length) setDraft(data as unknown as Record<string, unknown>);
    }).catch(() => {});
  }, []);
  useEffect(() => { setEditLocale(locale); }, [locale]);

  const counts = [s.products.length, s.productCategories.length, s.masterBrands.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length];
  const tabLabel = (a.tabs as unknown as string[])[15] ?? "About";

  const base = dict[editLocale] as unknown as Record<string, unknown>;
  const overrides = (draft[editLocale] ?? {}) as Record<string, unknown>;
  const ctx: Ctx = {
    get: (path) => {
      const o = deepGet(overrides, path);
      return o !== undefined ? o : deepGet(base, path);
    },
    def: (path) => deepGet(base, path),
    overridden: (path) => deepGet(overrides, path) !== undefined,
    set: (path, value) => setDraft((prev) => ({ ...prev, [editLocale]: deepSet((prev[editLocale] ?? {}) as Record<string, unknown>, path, value) })),
    clear: (path) => setDraft((prev) => ({ ...prev, [editLocale]: deletePath((prev[editLocale] ?? {}) as Record<string, unknown>, path) })),
  };
  const p = (key: string) => [ABOUT, key];

  const save = async () => {
    setErr(null); setSaving(true);
    const localeData = pruneEmpty((draft[editLocale] ?? {}) as Record<string, unknown>);
    const nextDraft = { ...draft, [editLocale]: localeData };
    try {
      await saveLocaleContent(editLocale, localeData);
      saveRaw(nextDraft);
      setDraft(nextDraft);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      saveRaw(nextDraft);
      setDraft(nextDraft);
    } finally { setSaving(false); }
  };

  const resetLocale = async () => {
    if (!confirm(`Reset all About overrides for ${editLocale.toUpperCase()}? This cannot be undone.`)) return;
    try { await deleteLocaleOverrides(editLocale); } catch {}
    setDraft((prev) => { const next = { ...prev }; delete next[editLocale]; return next; });
  };

  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;

  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {tabLabel}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-[22px] font-light leading-none text-[#2D4A22] sm:text-[26px]">About page content</h1>
          <p className="mt-2 max-w-[64ch] text-[12px] leading-5 text-[#1a1a16]/60">Every text, image and list on the public About page. Pick a language, edit, then Save — overrides apply instantly site-wide. Empty fields fall back to that language&apos;s default.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[#2D4A22]/10 bg-white p-1">
            {(locales as readonly Locale[]).map((l) => (
              <button key={l} onClick={() => setEditLocale(l)} className={`rounded-full px-3 py-1.5 text-[11px] tracking-[0.12em] ${editLocale === l ? "bg-[#2D4A22] text-white" : "text-[#2D4A22]/60 hover:text-[#2D4A22]"}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a href="/about" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5">View page</a>
          <button onClick={resetLocale} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5">Reset {editLocale.toUpperCase()}</button>
          <button onClick={save} disabled={saving} className="rounded-full bg-[#2D4A22] px-5 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317] disabled:opacity-60">{saving ? "Saving…" : a.save}</button>
        </div>
      </div>

      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {saved && <div className="mt-3 rounded-xl bg-[#2D4A22]/[0.06] border border-[#2D4A22]/15 px-4 py-2 text-[12px] text-[#2D4A22]">{a.contentSaved}</div>}

      <Card className="mt-4 p-3 sm:p-4">
        <p className="text-[10px] tracking-[0.16em] text-[#8B6F47]">SECTIONS · editing {editLocale.toUpperCase()}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SECTIONS.map((sec) => (
            <button key={sec.id} onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-full border border-[#2D4A22]/15 bg-white px-3.5 py-1.5 text-[11px] text-[#2D4A22] hover:bg-[#2D4A22] hover:text-white">
              {sec.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4">
        <Section id="hero" title="Hero video" desc="Full-bleed video at the top of the About page, plus its overlay text.">
          <MediaRow ctx={ctx} path={p("aboutHeroVideoSrc")} label="Video URL (mp4/webm)" accept="video/*" span />
          <MediaRow ctx={ctx} path={p("aboutHeroVideoPoster")} label="Poster image" span />
          <TextRow ctx={ctx} path={p("aboutHeroEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("aboutHeroTitle")} label="Title" />
          <TextRow ctx={ctx} path={p("aboutHeroDesc")} label="Description" multiline span />
        </Section>

        <Section id="intro" title="Intro / company profile" desc="The first block under the video — headline, lead paragraph, photo card and key stats.">
          <TextRow ctx={ctx} path={p("kicker")} label="Kicker" span />
          <TextRow ctx={ctx} path={p("titleA")} label="Title line 1" />
          <TextRow ctx={ctx} path={p("titleB")} label="Title line 2 (italic)" />
          <TextRow ctx={ctx} path={p("lead")} label="Lead paragraph" multiline span />
          <MediaRow ctx={ctx} path={p("heroImage")} label="Photo" span />
          <TextRow ctx={ctx} path={p("heroCardKicker")} label="Photo card · small text" />
          <TextRow ctx={ctx} path={p("heroCardTitle")} label="Photo card · title" />
          <ObjectList ctx={ctx} path={p("stats")} label="Stats" fields={[{ key: "k", label: "Value" }, { key: "v", label: "Label" }]} />
          <StringList ctx={ctx} path={p("toc")} label="Jump-to labels (one per section, in order: story, journey, chain, values, origins, warehouse)" />
        </Section>

        <Section id="story" title="Story" desc="Company story text, quote and the three cards beside it.">
          <TextRow ctx={ctx} path={p("storyEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("storyTitle")} label="Title line 1" />
          <TextRow ctx={ctx} path={p("storyTitleIt")} label="Title line 2 (italic)" />
          <TextRow ctx={ctx} path={p("storyP1")} label="Paragraph 1" multiline span />
          <TextRow ctx={ctx} path={p("storyP2")} label="Paragraph 2" multiline span />
          <TextRow ctx={ctx} path={p("storyP3")} label="Paragraph 3 (highlighted)" multiline span />
          <TextRow ctx={ctx} path={p("quote")} label="Quote" multiline span />
          <TextRow ctx={ctx} path={p("quoteBy")} label="Quote attribution" />
          <MediaRow ctx={ctx} path={p("storyImage")} label="Card image" />
          <TextRow ctx={ctx} path={p("storyCardLabel")} label="Card · small text" />
          <TextRow ctx={ctx} path={p("storyCardDesc")} label="Card · description" multiline span />
          <TextRow ctx={ctx} path={p("promiseLabel")} label="Promise card · small text" />
          <TextRow ctx={ctx} path={p("promiseDesc")} label="Promise card · text" multiline span />
          <TextRow ctx={ctx} path={p("b2bLabel")} label="For B2B card · small text" />
          <TextRow ctx={ctx} path={p("b2bDesc")} label="For B2B card · text" multiline span />
        </Section>

        <Section id="journey" title="Journey timeline" desc="Milestones on the alternating timeline.">
          <TextRow ctx={ctx} path={p("journeyEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("journeyTitle")} label="Title" />
          <TextRow ctx={ctx} path={p("journeyTitleIt")} label="Title (italic)" />
          <ObjectList ctx={ctx} path={p("timeline")} label="Timeline entries" fields={[{ key: "y", label: "Year / tag" }, { key: "t", label: "Title" }, { key: "d", label: "Description", multiline: true }]} />
        </Section>

        <Section id="chain" title="Supply chain" desc="How-we-work steps and the 'why it matters' banner.">
          <TextRow ctx={ctx} path={p("chainEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("chainTitle")} label="Title" />
          <TextRow ctx={ctx} path={p("chainTitleIt")} label="Title (italic)" />
          <TextRow ctx={ctx} path={p("chainNote")} label="Side note" multiline span />
          <ObjectList ctx={ctx} path={p("steps")} label="Steps" fields={[{ key: "n", label: "Number" }, { key: "t", label: "Title" }, { key: "d", label: "Description", multiline: true }]} />
          <MediaRow ctx={ctx} path={p("chainImage")} label="Banner image" span />
          <TextRow ctx={ctx} path={p("whyLabel")} label="Banner · small text" />
          <TextRow ctx={ctx} path={p("whyCta")} label="Banner · button label" />
          <TextRow ctx={ctx} path={p("whyTitle")} label="Banner · title" multiline span />
          <TextRow ctx={ctx} path={p("whyDesc")} label="Banner · description" multiline span />
        </Section>

        <Section id="values" title="Vision & mission" desc="Value cards in the Vision & Mission section (add or remove up to any number).">
          <TextRow ctx={ctx} path={p("valuesEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("valuesTitle")} label="Section title" />
          <ObjectList ctx={ctx} path={p("values")} label="Value cards" fields={[{ key: "t", label: "Title" }, { key: "d", label: "Description", multiline: true }]} />
        </Section>

        <Section id="origins" title="Categories" desc="Category cards — name, origin label, description and image.">
          <TextRow ctx={ctx} path={p("originsEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("originsTitle")} label="Section title" />
          <ObjectList ctx={ctx} path={p("origins")} label="Category cards" fields={[{ key: "place", label: "Label" }, { key: "name", label: "Name" }, { key: "desc", label: "Description", multiline: true }, { key: "img", label: "Image", image: true }]} />
        </Section>

        <Section id="warehouse" title="Warehouse / supply assurance" desc="Warehouse photo, stat tiles and bullet list.">
          <TextRow ctx={ctx} path={p("whEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("whTitle")} label="Title" />
          <TextRow ctx={ctx} path={p("whTitleIt")} label="Title (italic)" />
          <TextRow ctx={ctx} path={p("whBullets")} label="Bullet list" multiline span />
          <MediaRow ctx={ctx} path={p("whImage")} label="Photo" span />
          <ObjectList ctx={ctx} path={p("whStats")} label="Stat tiles" fields={[{ key: "k", label: "Value" }, { key: "v", label: "Label" }]} />
        </Section>

        <Section id="cta" title="Closing CTA" desc="Dark call-to-action band and its contact card.">
          <TextRow ctx={ctx} path={p("ctaEyebrow")} label="Eyebrow" />
          <TextRow ctx={ctx} path={p("ctaTitle")} label="Title" />
          <TextRow ctx={ctx} path={p("ctaDesc")} label="Description" multiline span />
          <TextRow ctx={ctx} path={p("ctaBtn")} label="Button label" />
          <TextRow ctx={ctx} path={p("ctaCardLabel")} label="Card · small text" />
          <TextRow ctx={ctx} path={p("ctaCardDesc")} label="Card · text" multiline span />
          <TextRow ctx={ctx} path={p("ctaEmail")} label="Email address" />
          <TextRow ctx={ctx} path={p("ctaWhatsapp")} label="WhatsApp link" />
        </Section>

        <Section id="shared" title="Badges & marquee" desc="Shared lists — also used on the home page.">
          <StringList ctx={ctx} path={["aboutBadges"]} label="Company badges (shown in the sticky bar and warehouse section)" />
          <StringList ctx={ctx} path={["marquee"]} label="Marquee words" />
        </Section>
      </div>
    </AdminShell>
  );
}
