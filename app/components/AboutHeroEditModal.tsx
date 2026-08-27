"use client";
import { useEffect, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { useLang, dict, type Locale, locales } from "../i18n";
import { getLocaleOverrides, setLocaleOverrides, deepSet } from "../lib/siteContent";

const FIELDS = [
  { key: "aboutHeroEyebrow", label: "Eyebrow", multiline: false },
  { key: "aboutHeroTitle", label: "Title", multiline: false },
  { key: "aboutHeroDesc", label: "Description", multiline: true },
  { key: "aboutHeroVideoSrc", label: "Video URL (mp4/webm)", multiline: false },
  { key: "aboutHeroVideoPoster", label: "Poster image URL", multiline: false },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
const ALL_FIELDS: FieldKey[] = FIELDS.map((f) => f.key);

function baseValue(loc: Locale, key: FieldKey): string {
  return (dict[loc].aboutDetail as unknown as Record<string, string>)[key] ?? "";
}
function readValues(loc: Locale): Record<FieldKey, string> {
  const cur = getLocaleOverrides(loc);
  const out = {} as Record<FieldKey, string>;
  for (const k of ALL_FIELDS) {
    const overridden = (cur.aboutDetail as Record<string, unknown> | undefined)?.[k];
    out[k] = typeof overridden === "string" ? overridden : baseValue(loc, k);
  }
  return out;
}
function deleteKey(obj: Record<string, unknown>, key: string): Record<string, unknown> {
  if (!(key in obj)) return obj;
  const next = { ...obj };
  delete next[key];
  return next;
}

export default function AboutHeroEditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLang();
  const [editLocale, setEditLocale] = useState<Locale>(locale);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Edit About Hero" onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#2D4A22]/10 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#2D4A22]/10 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · EDIT IN PLACE</p>
            <h2 className="mt-0.5 font-[var(--font-display)] text-[20px] font-light leading-none text-[#2D4A22] sm:text-[22px]">About Hero Video</h2>
            <p className="mt-1 text-[11px] leading-4 text-[#1a1a16]/55">Edits save instantly. Empty fields fall back to the default for that language.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-full p-2 text-[#2D4A22]/60 hover:bg-[#2D4A22]/5 hover:text-[#2D4A22]"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#2D4A22]/10 bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-1 rounded-full border border-[#2D4A22]/10 bg-white p-1">
            {(locales as readonly Locale[]).map((l) => (
              <button key={l} onClick={() => setEditLocale(l)} className={`rounded-full px-3 py-1.5 text-[11px] tracking-[0.12em] ${editLocale === l ? "bg-[#2D4A22] text-white" : "text-[#2D4A22]/60 hover:text-[#2D4A22]"}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <span className="ml-1 text-[11px] text-[#8B6F47]">Editing:&nbsp;<span className="font-medium text-[#2D4A22]">{editLocale.toUpperCase()}</span></span>
        </div>

        <Editor key={editLocale} editLocale={editLocale} onClose={onClose} />
      </div>
    </div>
  );
}

function Editor({ editLocale, onClose }: { editLocale: Locale; onClose: () => void }) {
  const [draft, setDraft] = useState<Record<FieldKey, string>>(() => readValues(editLocale));
  const [saved, setSaved] = useState(false);

  const update = (k: FieldKey, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    const cur = getLocaleOverrides(editLocale);
    const curAbout = (cur.aboutDetail as Record<string, unknown> | undefined) ?? {};
    let nextAbout: Record<string, unknown> = { ...curAbout };
    for (const k of ALL_FIELDS) {
      const v = draft[k]?.trim() ?? "";
      if (!v) nextAbout = deleteKey(nextAbout, k);
      else nextAbout = deepSet(nextAbout, [k], v) as Record<string, unknown>;
    }
    const next = deepSet(cur, ["aboutDetail"], nextAbout) as Record<string, unknown>;
    setLocaleOverrides(editLocale, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const resetAll = () => {
    if (!confirm("Reset all About Hero overrides for this language? This cannot be undone.")) return;
    const cur = getLocaleOverrides(editLocale);
    const next = deepSet(cur, ["aboutDetail"], {}) as Record<string, unknown>;
    setLocaleOverrides(editLocale, next);
    setDraft(readValues(editLocale));
  };

  return (
    <>
      <div className="max-h-[70vh] overflow-y-auto bg-white px-4 py-4 sm:px-5">
        <div className="grid gap-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="flex items-center justify-between text-[11px] font-medium tracking-[0.08em] text-[#2D4A22]">
                <span>{f.label}</span>
                <span className="font-mono text-[10px] tracking-[0.04em] text-[#8B6F47]/60">{f.key}</span>
              </span>
              {f.multiline ? (
                <textarea value={draft[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-[#2D4A22]/15 bg-white px-3 py-2 text-[12px] leading-5 outline-none placeholder:text-[#8B6F47]/50 focus:border-[#2D4A22]/30" placeholder={`Default: ${baseValue(editLocale, f.key)}`} />
              ) : (
                <input value={draft[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} className="mt-1.5 w-full rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[12px] outline-none placeholder:text-[#8B6F47]/50 focus:border-[#2D4A22]/30" placeholder={`Default: ${baseValue(editLocale, f.key)}`} />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#2D4A22]/10 bg-white px-4 py-3 sm:px-5">
        <button onClick={resetAll} className="inline-flex items-center gap-1.5 rounded-full border border-[#2D4A22]/15 px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5"><RotateCcw className="h-3 w-3" />Reset</button>
        <p className="text-[11px] text-[#8B6F47]">Empty fields fall back to the language default.</p>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="rounded-full border border-[#2D4A22]/15 px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5">Close</button>
          <button onClick={save} className="rounded-full bg-[#2D4A22] px-5 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317]">Save</button>
        </div>
      </div>

      {saved && <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[#2D4A22] px-3 py-1 text-[11px] text-white shadow">Saved.</div>}
    </>
  );
}
