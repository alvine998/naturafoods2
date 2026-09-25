"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Card, Field, FileUpload, Input, TextArea } from "../_components";
import {
  DEFAULT_COMPANY_SETTINGS,
  createCompanySettings,
  deleteCompanySettings,
  fetchAdminCompanySettings,
  fetchCompanySettings,
  normalizeCompanySettings,
  replaceCompanySettings,
  type CompanySettings,
} from "../../lib/companySettings";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div>
        <h2 className="font-[var(--font-display)] text-[15px] font-light text-[#2D4A22]">{title}</h2>
        {desc && <p className="mt-1 text-[11px] leading-5 text-[#8B6F47]">{desc}</p>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export default function CompanySettingsAdminPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const s = useStore();
  const [gate, setGate] = useState(false);
  const [form, setForm] = useState<CompanySettings>({ ...DEFAULT_COMPANY_SETTINGS });
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else setGate(true); }, [router]);
  useEffect(() => {
    if (!gate) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Prefer the authed singleton; fall back to the public endpoint / local cache.
      const admin = await fetchAdminCompanySettings().catch(() => null);
      if (cancelled) return;
      if (admin) {
        setForm(admin);
        setExists(true);
      } else {
        const pub = await fetchCompanySettings().catch(() => ({ ...DEFAULT_COMPANY_SETTINGS }));
        if (cancelled) return;
        setForm(normalizeCompanySettings(pub));
        setExists(false);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [gate]);

  const tabLabel = (a.tabs as unknown as string[])[16] ?? "Settings";
  const counts = [s.products.length, s.productCategories.length, s.masterBrands.length, s.homeBrands.length, s.officialPartners.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0, s.salesContacts.length, s.socialMedia.length, 0, 0];

  const set = (k: keyof CompanySettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setErr(null);
    setSaving(true);
    const payload: Partial<CompanySettings> = { ...form, name: form.name.trim() || DEFAULT_COMPANY_SETTINGS.name };
    try {
      let next: CompanySettings;
      if (exists) {
        try {
          next = await replaceCompanySettings(payload);
        } catch (e) {
          // Row may have been deleted server-side — fall back to create.
          if ((e as { status?: number })?.status === 404) next = await createCompanySettings(payload);
          else throw e;
        }
      } else {
        try {
          next = await createCompanySettings(payload);
        } catch (e) {
          // Row already exists (409) — switch to full replace.
          if ((e as { status?: number })?.status === 409) next = await replaceCompanySettings(payload);
          else throw e;
        }
      }
      setForm(next);
      setExists(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!confirm("Reset company settings to default? This deletes the server row (next GET recreates default).")) return;
    setErr(null);
    setSaving(true);
    try {
      await deleteCompanySettings().catch(() => {});
      const next = await fetchCompanySettings().catch(() => ({ ...DEFAULT_COMPANY_SETTINGS }));
      setForm(normalizeCompanySettings(next));
      setExists(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;

  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {tabLabel}</p>
          <h1 className="mt-1 font-[var(--font-display)] text-[22px] font-light leading-none text-[#2D4A22] sm:text-[26px]">Company settings</h1>
          <p className="mt-2 max-w-[64ch] text-[12px] leading-5 text-[#1a1a16]/60">
            Company name, logo, description, visi, misi, contact &amp; social links. Saved to the <code className="rounded bg-white px-1 py-0.5 border border-[#2D4A22]/10">company_settings</code> singleton
            and applied site-wide (nav logo, footer, About Visi &amp; Misi).
            {exists === true ? " · Server row exists." : exists === false ? " · No server row yet — Save to create it." : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5">View site</a>
          <button onClick={resetToDefault} disabled={saving || loading} className="rounded-full border border-[#2D4A22]/15 bg-white px-4 py-2 text-[11px] tracking-[0.12em] text-[#2D4A22] hover:bg-[#2D4A22]/5 disabled:opacity-60">Reset to default</button>
          <button onClick={save} disabled={saving || loading} className="rounded-full bg-[#2D4A22] px-5 py-2 text-[11px] tracking-[0.12em] text-white hover:bg-[#1e3317] disabled:opacity-60">{saving ? "Saving…" : a.save}</button>
        </div>
      </div>

      {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-[12px] text-red-700">{err}</div>}
      {saved && <div className="mt-3 rounded-xl bg-[#2D4A22]/[0.06] border border-[#2D4A22]/15 px-4 py-2 text-[12px] text-[#2D4A22]">{a.contentSaved}</div>}
      {loading && <div className="mt-3 rounded-xl border border-[#2D4A22]/10 bg-white px-4 py-2 text-[12px] text-[#8B6F47]">Loading company settings…</div>}

      <div className="mt-4 grid gap-4">
        <Section title="Identity" desc="Row id is the primary key (singleton: “default”). Name, tagline, description and logo appear across the site.">
          <div>
            <Field label="ID (primary key)">
              <Input value={form.id} onChange={(e) => set("id", e.target.value)} placeholder={DEFAULT_COMPANY_SETTINGS.id} />
            </Field>
          </div>
          <div>
            <Field label="Company name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={DEFAULT_COMPANY_SETTINGS.name} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Tagline">
              <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder={DEFAULT_COMPANY_SETTINGS.tagline} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <TextArea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder={DEFAULT_COMPANY_SETTINGS.description} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Logo">
              <FileUpload value={form.logo} onChange={(v) => set("logo", v)} folder="settings" />
            </Field>
          </div>
        </Section>

        <Section title="Visi & Misi" desc="Shown on the About page Vision & Mission cards. Overrides the per-language defaults when set.">
          <div className="sm:col-span-2">
            <Field label="Visi">
              <TextArea value={form.visi} onChange={(e) => set("visi", e.target.value)} rows={3} placeholder={DEFAULT_COMPANY_SETTINGS.visi} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Misi">
              <TextArea value={form.misi} onChange={(e) => set("misi", e.target.value)} rows={3} placeholder={DEFAULT_COMPANY_SETTINGS.misi} />
            </Field>
          </div>
        </Section>

        <Section title="Contact" desc="Address, email, phone, WhatsApp, website and map link.">
          <div>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={DEFAULT_COMPANY_SETTINGS.email} />
            </Field>
          </div>
          <div>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={DEFAULT_COMPANY_SETTINGS.phone} />
            </Field>
          </div>
          <div>
            <Field label="WhatsApp">
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="62812…" />
            </Field>
          </div>
          <div>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address">
              <TextArea value={form.address} onChange={(e) => set("address", e.target.value)} rows={3} placeholder={DEFAULT_COMPANY_SETTINGS.address} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Maps URL">
              <Input value={form.maps_url} onChange={(e) => set("maps_url", e.target.value)} placeholder="https://maps.google.com/…" />
            </Field>
          </div>
        </Section>

        <Section title="Social media" desc="Links used in the footer and contact sections.">
          <div>
            <Field label="Instagram">
              <Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/…" />
            </Field>
          </div>
          <div>
            <Field label="Facebook">
              <Input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="https://facebook.com/…" />
            </Field>
          </div>
          <div>
            <Field label="TikTok">
              <Input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="https://tiktok.com/…" />
            </Field>
          </div>
          <div>
            <Field label="YouTube">
              <Input value={form.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/…" />
            </Field>
          </div>
        </Section>
      </div>
    </AdminShell>
  );
}
