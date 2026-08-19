"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MessageCircle, Save, RotateCcw, Plus, Trash2, TestTube, Upload, Download, Settings2, Languages, Database, Sparkles, ChevronUp, ChevronDown } from "lucide-react";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card, Field, Input, TextArea } from "../_components";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssistantConfig, DEFAULT_ASSISTANT, DEFAULT_TUNING, type KnowledgeEntry, type LocaleCopy, type AssistantTuning } from "../../lib/assistant";
import { resolveReply, getCopy } from "../../lib/assistant";

const LOCALES = ["en", "id", "zh"] as const;
type Tab = "general" | "copy" | "knowledge" | "playground";
const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", Icon: Settings2 },
  { id: "copy", label: "Copy (i18n)", Icon: Languages },
  { id: "knowledge", label: "Knowledge", Icon: Database },
  { id: "playground", label: "Playground", Icon: TestTube },
];

export default function AssistantPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const { cfg, setCfg, reset } = useAssistantConfig();
  const [tab, setTab] = useState<Tab>("knowledge");
  const [copyLoc, setCopyLoc] = useState<(typeof LOCALES)[number]>("en");
  const [saved, setSaved] = useState(false);
  const [testQ, setTestQ] = useState("");
  const [testLocale, setTestLocale] = useState<string>("en");

  useEffect(() => {
    if (!isAuthed()) router.replace("/admin/login");
    else setGate(true);
  }, [router]);

  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0];
  const tuning: AssistantTuning = cfg.tuning ?? DEFAULT_TUNING;

  const testReply = useMemo(() => {
    if (!testQ.trim()) return "";
    return resolveReply(cfg, testQ, testLocale);
  }, [cfg, testQ, testLocale]);

  const onSave = () => { setSaved(true); setTimeout(() => setSaved(false), 1400); };
  const addEntry = () => {
    const id = `kb_${Date.now().toString(36)}`;
    const entry: KnowledgeEntry = { id, keywords: [], reply: { en: "", id: "", zh: "" } };
    setCfg((c) => ({ ...c, knowledge: [...c.knowledge, entry] }));
  };
  const updateEntry = (id: string, patch: Partial<KnowledgeEntry>) =>
    setCfg((c) => ({ ...c, knowledge: c.knowledge.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const removeEntry = (id: string) => setCfg((c) => ({ ...c, knowledge: c.knowledge.filter((e) => e.id !== id) }));
  const moveEntry = (idx: number, dir: -1 | 1) =>
    setCfg((c) => {
      const next = [...c.knowledge];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return c;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...c, knowledge: next };
    });
  const updateCopy = (locale: string, patch: Partial<LocaleCopy>) =>
    setCfg((c) => ({ ...c, copy: { ...c.copy, [locale]: { ...c.copy[locale], ...patch } } }));
  const setTuning = (patch: Partial<AssistantTuning>) =>
    setCfg((c) => ({ ...c, tuning: { ...(c.tuning ?? DEFAULT_TUNING), ...patch } }));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = "assistant-config.json"; el.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)); setCfg(parsed); } catch {} };
    reader.readAsText(file);
  };

  if (!gate) return <div className="min-h-screen bg-[#FFFCF2] grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;

  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D4A22] text-white"><Bot className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · AI Virtual Assistant</p>
            <h1 className="mt-0.5 text-[22px] font-light leading-none text-[#2D4A22]">Fine-Tuning AI Assistant</h1>
            <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">Knowledge tab tunes how the bot answers — persona + answer behavior + replies.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] text-[#2D4A22] hover:bg-[#FFFCF2]">
            <Upload className="h-3.5 w-3.5" /> Import<input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.currentTarget.value = ""; }} />
          </label>
          <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] text-[#2D4A22] hover:bg-[#FFFCF2]"><Download className="h-3.5 w-3.5" /> Export</button>
          <button onClick={() => { if (confirm("Reset assistant to defaults?")) reset(); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] text-[#2D4A22] hover:bg-[#FFFCF2]"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
          <button onClick={onSave} className="inline-flex items-center gap-1.5 rounded-full bg-[#2D4A22] px-5 py-2 text-[11px] tracking-[0.08em] text-white hover:bg-[#1e3317]"><Save className="h-3.5 w-3.5" /> {saved ? "Saved ✓" : "Save"}</button>
        </div>
      </div>

      <div className="mt-6 flex gap-1.5 overflow-x-auto rounded-full border border-[#2D4A22]/10 bg-white p-1.5 w-fit max-w-full scrollbar-none">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[11px] tracking-[0.08em] transition ${tab === tb.id ? "bg-[#2D4A22] text-white shadow" : "text-[#2D4A22]/60 hover:bg-[#FFFCF2] hover:text-[#2D4A22]"}`}
          >
            <tb.Icon className="h-3.5 w-3.5" /> {tb.label}
            {tb.id === "knowledge" && <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none ${tab === tb.id ? "bg-white/15 text-white" : "bg-[#2D4A22]/10 text-[#2D4A22]"}`}>{cfg.knowledge.length}</span>}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <Card className="mt-4 p-4 sm:p-5">
          <h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">GENERAL</h3>
          <p className="mt-1 text-[11px] text-[#8B6F47]">Handoff + fallback. Answer style lives in Knowledge tab.</p>
          <div className="mt-4 grid gap-4">
            <Field label="WhatsApp link (wa.me)">
              <Input value={cfg.waLink} onChange={(e) => setCfg((c) => ({ ...c, waLink: e.target.value }))} placeholder="https://wa.me/6281234567890" />
            </Field>
          </div>
        </Card>
      )}

      {tab === "copy" && (
        <Card className="mt-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">COPY PER LOCALE</h3>
            <div className="flex gap-1 rounded-full border border-[#2D4A22]/10 bg-[#FFFCF2] p-1">
              {LOCALES.map((l) => (
                <button key={l} onClick={() => setCopyLoc(l)} className={`rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.08em] ${copyLoc === l ? "bg-[#2D4A22] text-white" : "text-[#2D4A22]/60 hover:text-[#2D4A22]"}`}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
          {(() => {
            const c = cfg.copy[copyLoc];
            return (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="title"><Input value={c.title} onChange={(e) => updateCopy(copyLoc, { title: e.target.value })} /></Field>
                <Field label="subtitle"><Input value={c.sub} onChange={(e) => updateCopy(copyLoc, { sub: e.target.value })} /></Field>
                <Field label="placeholder"><Input value={c.placeholder} onChange={(e) => updateCopy(copyLoc, { placeholder: e.target.value })} /></Field>
                <Field label="send label"><Input value={c.send} onChange={(e) => updateCopy(copyLoc, { send: e.target.value })} /></Field>
                <Field label="quick chips (comma separated)"><Input value={c.quick.join(", ")} onChange={(e) => updateCopy(copyLoc, { quick: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
                <Field label="WhatsApp label"><Input value={c.wa} onChange={(e) => updateCopy(copyLoc, { wa: e.target.value })} /></Field>
                <Field label="contact label"><Input value={c.contact} onChange={(e) => updateCopy(copyLoc, { contact: e.target.value })} /></Field>
                <div className="sm:col-span-2"><Field label="greeting"><TextArea value={c.greet} onChange={(e) => updateCopy(copyLoc, { greet: e.target.value })} rows={3} /></Field></div>
                <div className="sm:col-span-2"><Field label="fallback"><TextArea value={c.fallback} onChange={(e) => updateCopy(copyLoc, { fallback: e.target.value })} rows={3} /></Field></div>
              </div>
            );
          })()}
        </Card>
      )}

      {tab === "knowledge" && (
        <div className="mt-4 grid gap-4">
          {/* Tuning: persona + behavior controls that change how answers are formed */}
          <Card className="p-4 sm:p-5 border-[#2D4A22]/20">
            <h3 className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-[#2D4A22]"><Sparkles className="h-3.5 w-3.5" /> TUNING — how the assistant answers</h3>
            <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">Persona shapes the bot's role & constraints. Behavior knobs below change answer style (applied to every reply, including knowledge matches). Test in Playground.</p>
            <div className="mt-4 grid gap-4">
              <Field label="Persona / system prompt">
                <TextArea value={cfg.persona} onChange={(e) => setCfg((c) => ({ ...c, persona: e.target.value }))} rows={3} placeholder={DEFAULT_ASSISTANT.persona} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label>Tone</Label>
                  <Select value={tuning.tone} onValueChange={(v) => setTuning({ tone: v as AssistantTuning["tone"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Length</Label>
                  <Select value={tuning.length} onValueChange={(v) => setTuning({ length: v as AssistantTuning["length"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1 sentence)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Strict</Label>
                  <label className="flex h-10 items-center gap-2 rounded-full border border-[#2D4A22]/15 bg-[#FFFCF2] px-4 text-[12px] text-[#2D4A22]">
                    <input type="checkbox" checked={tuning.strict} onChange={(e) => setTuning({ strict: e.target.checked })} className="accent-[#2D4A22]" />
                    Knowledge-only (no generic fallback)
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-[#8B6F47]">Persona + tone/length/strict are read by <code className="rounded bg-[#FFFCF2] px-1 py-0.5">resolveReply</code> and will be the <code className="rounded bg-[#FFFCF2] px-1 py-0.5">system prompt</code> when you wire a real LLM.</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[11px] tracking-[0.14em] text-[#2D4A22]">KNOWLEDGE ENTRIES (keyword → reply)</h3>
                <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">First matching entry wins (substring, case-insensitive). Use ↑/↓ to reorder — top entry checked first.</p>
              </div>
              <button onClick={addEntry} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#2D4A22] px-4 py-2 text-[11px] text-white hover:bg-[#1e3317]"><Plus className="h-3.5 w-3.5" /> Add</button>
            </div>
            <div className="mt-4 grid gap-3">
              {cfg.knowledge.map((entry, idx) => (
                <div key={entry.id} className="rounded-2xl border border-[#2D4A22]/10 bg-[#FFFCF2] p-4">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1 pt-6">
                      <button onClick={() => moveEntry(idx, -1)} disabled={idx === 0} className="rounded-full border border-[#2D4A22]/10 bg-white p-1.5 disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
                      <button onClick={() => moveEntry(idx, 1)} disabled={idx === cfg.knowledge.length - 1} className="rounded-full border border-[#2D4A22]/10 bg-white p-1.5 disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#2D4A22] px-2 py-0.5 text-[10px] tracking-[0.08em] text-white">#{idx + 1}</span>
                        <span className="text-[11px] text-[#8B6F47] truncate">{entry.id}</span>
                      </div>
                      <div className="mt-2"><Field label="keywords (comma separated)"><Input value={entry.keywords.join(", ")} onChange={(e) => updateEntry(entry.id, { keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="price, moq, harga" /></Field></div>
                      <div className="mt-3 grid gap-3">
                        {LOCALES.map((loc) => (
                          <Field key={loc} label={`reply — ${loc}`}>
                            <TextArea value={entry.reply[loc] ?? ""} onChange={(e) => updateEntry(entry.id, { reply: { ...entry.reply, [loc]: e.target.value } })} rows={2} placeholder={getCopy(cfg, loc).fallback.slice(0, 48)} />
                          </Field>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeEntry(entry.id)} className="mt-6 shrink-0 rounded-full border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {cfg.knowledge.length === 0 && <p className="rounded-xl border border-dashed border-[#2D4A22]/15 bg-white px-4 py-6 text-center text-[11px] text-[#8B6F47]">No entries — add one or reset to defaults.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === "playground" && (
        <Card className="mt-4 p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-[#2D4A22]"><TestTube className="h-3.5 w-3.5" /> PLAYGROUND — test reply</h3>
          <p className="mt-1 text-[11px] text-[#8B6F47]">Persona + tuning from Knowledge tab applied here. Edit there, test here.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex gap-1 rounded-full border border-[#2D4A22]/10 bg-[#FFFCF2] p-1 w-fit">
              {LOCALES.map((l) => (
                <button key={l} onClick={() => setTestLocale(l)} className={`rounded-full px-3 py-1.5 text-[11px] tracking-[0.08em] ${testLocale === l ? "bg-[#2D4A22] text-white" : "text-[#2D4A22]/60 hover:text-[#2D4A22]"}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <Input value={testQ} onChange={(e) => setTestQ(e.target.value)} placeholder="Try: price, delivery, matcha..." className="flex-1" />
          </div>
          {testQ.trim() ? (
            <div className="mt-4 rounded-2xl border border-[#2D4A22]/10 bg-[#FFFCF2] p-4">
              <p className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-[#8B6F47]"><MessageCircle className="h-3 w-3" /> BOT REPLY · {testLocale.toUpperCase()}</p>
              <p className="mt-2 text-[13px] leading-6 text-[#2D4A22]">{testReply}</p>
              <p className="mt-2 text-[10px] tracking-[0.08em] text-[#8B6F47]">persona: {tuning.tone} · {tuning.length}{tuning.strict ? " · strict" : ""}</p>
            </div>
          ) : (
            <p className="mt-4 text-[11px] text-[#8B6F47]">Type a question to preview which knowledge entry matches.</p>
          )}
        </Card>
      )}
    </AdminShell>
  );
}
