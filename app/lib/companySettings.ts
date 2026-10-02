"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "./api";

// ---------------------------------------------------------------------------
// Company Settings — singleton row in `company_settings` (backend.md:18).
// Public GET /company-settings powers SiteNav logo, SiteFooter and the
// About Visi/Misi section. Admin CRUD at /admin/company-settings.
// Local cache key mirrors the other domain stores (offline-first).
// ---------------------------------------------------------------------------

export type CompanySettings = {
  id: string;
  name: string;
  logo: string;
  description: string;
  visi: string;
  misi: string;
  visi_background: string;
  misi_background: string;
  visi_person_photo: string;
  visi_person_name: string;
  visi_person_position: string;
  misi_person_photo: string;
  misi_person_name: string;
  misi_person_position: string;
  career_banner: string;
  career_url: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  maps_url: string;
  created_at?: string;
  updated_at?: string;
};

export const COMPANY_SETTINGS_KEY = "nf_company_settings";
export const COMPANY_SETTINGS_EVENT = "nf_company_settings_updated";
export const DEFAULT_COMPANY_SETTINGS_ID = "default";

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  id: DEFAULT_COMPANY_SETTINGS_ID,
  name: "PT Natura Inti Sukses",
  logo: "/logo.png",
  description:
    "PT Natura Inti Sukses is an importer & distributor of food and beverage ingredients in Indonesia — especially baking ingredients.",
  visi: "To be a Market Leader for Food Ingredient & Additives in Indonesia.",
  misi: "To achieve Customer's Satisfaction & Major Market Share with selected Quality Products & Marketing Network supported by qualified human resources.",
  visi_background: "",
  misi_background: "",
  visi_person_photo: "",
  visi_person_name: "",
  visi_person_position: "",
  misi_person_photo: "",
  misi_person_name: "",
  misi_person_position: "",
  career_banner: "",
  career_url: "",
  tagline: "Food & Beverage Ingredients · Baking Ingredients",
  email: "info@naturafoods.co.id",
  phone: "0812 9507 1397",
  whatsapp: "",
  address:
    "Jl. Pangeran Tubagus Angke No.128-129, RT.15/RW.2, Angke, Kec. Tambora, Kota Jakarta Barat, DKI Jakarta 11330",
  website: "",
  instagram: "https://instagram.com",
  facebook: "",
  tiktok: "",
  youtube: "",
  maps_url: "",
};

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v);
}

// Accept both snake_case (DB) and camelCase (legacy/API variants).
export function normalizeCompanySettings(raw: unknown): CompanySettings {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: str(r.id ?? DEFAULT_COMPANY_SETTINGS_ID, DEFAULT_COMPANY_SETTINGS_ID),
    name: str(r.name ?? r.companyName ?? DEFAULT_COMPANY_SETTINGS.name),
    logo: str(r.logo ?? r.logoUrl ?? DEFAULT_COMPANY_SETTINGS.logo),
    description: str(r.description ?? DEFAULT_COMPANY_SETTINGS.description),
    visi: str(r.visi ?? r.vision ?? DEFAULT_COMPANY_SETTINGS.visi),
    misi: str(r.misi ?? r.mission ?? DEFAULT_COMPANY_SETTINGS.misi),
    visi_background: str(r.visi_background ?? r.visiBackground ?? ""),
    misi_background: str(r.misi_background ?? r.misiBackground ?? ""),
    visi_person_photo: str(r.visi_person_photo ?? r.visiPersonPhoto ?? ""),
    visi_person_name: str(r.visi_person_name ?? r.visiPersonName ?? ""),
    visi_person_position: str(r.visi_person_position ?? r.visiPersonPosition ?? ""),
    misi_person_photo: str(r.misi_person_photo ?? r.misiPersonPhoto ?? ""),
    misi_person_name: str(r.misi_person_name ?? r.misiPersonName ?? ""),
    misi_person_position: str(r.misi_person_position ?? r.misiPersonPosition ?? ""),
    career_banner: str(r.career_banner ?? r.careerBanner ?? ""),
    career_url: str(r.career_url ?? r.careerUrl ?? r.url_career ?? r.urlCareer ?? ""),
    tagline: str(r.tagline ?? DEFAULT_COMPANY_SETTINGS.tagline),
    email: str(r.email ?? DEFAULT_COMPANY_SETTINGS.email),
    phone: str(r.phone ?? DEFAULT_COMPANY_SETTINGS.phone),
    whatsapp: str(r.whatsapp ?? ""),
    address: str(r.address ?? DEFAULT_COMPANY_SETTINGS.address),
    website: str(r.website ?? ""),
    instagram: str(r.instagram ?? ""),
    facebook: str(r.facebook ?? ""),
    tiktok: str(r.tiktok ?? ""),
    youtube: str(r.youtube ?? ""),
    maps_url: str(r.maps_url ?? r.mapsUrl ?? ""),
    created_at: str(r.created_at ?? r.createdAt ?? ""),
    updated_at: str(r.updated_at ?? r.updatedAt ?? ""),
  };
}

function loadCached(): CompanySettings {
  try {
    const v = localStorage.getItem(COMPANY_SETTINGS_KEY);
    if (v) return normalizeCompanySettings(JSON.parse(v));
  } catch {}
  return { ...DEFAULT_COMPANY_SETTINGS };
}

function saveCached(v: CompanySettings) {
  try {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(v));
    try {
      window.dispatchEvent(new CustomEvent(COMPANY_SETTINGS_EVENT));
    } catch {}
  } catch {}
}

// ---------------------------------------------------------------------------
// API — FRONTEND_API_GUIDE.md:15 / backend.md:18
// GET /company-settings (public singleton)
// GET /company-settings/:id (public)
// GET /admin/company-settings (auth, singleton)
// POST /admin/company-settings (auth, 409 if exists)
// PUT /admin/company-settings (auth, full replace)
// PATCH /admin/company-settings (auth, partial)
// DELETE /admin/company-settings (auth, next GET recreates default)
// ---------------------------------------------------------------------------

export async function fetchCompanySettings(): Promise<CompanySettings> {
  const fallback = loadCached();
  try {
    const json = await apiFetch<unknown>("/company-settings");
    if (json.success && json.data != null) {
      const next = normalizeCompanySettings(json.data);
      saveCached(next);
      return next;
    }
  } catch {}
  return fallback;
}

export async function fetchCompanySettingsById(id: string): Promise<CompanySettings> {
  const json = await apiFetch<unknown>(`/company-settings/${encodeURIComponent(id)}`);
  if (!json.success || json.data == null) throw new Error("Company settings not found");
  const next = normalizeCompanySettings(json.data);
  saveCached(next);
  return next;
}

export async function fetchAdminCompanySettings(): Promise<CompanySettings | null> {
  try {
    const json = await apiFetch<unknown>("/admin/company-settings");
    if (json.success && json.data != null) {
      const next = normalizeCompanySettings(json.data);
      saveCached(next);
      return next;
    }
  } catch {}
  return null;
}

/**
 * Fresh existence check for save-time branching (POST when missing, PUT when
 * present). Returns false ONLY on 404 — any other failure (network, 401…)
 * is rethrown so callers surface the real error instead of guessing wrong.
 */
export async function companySettingsExists(): Promise<boolean> {
  try {
    const json = await apiFetch<unknown>("/admin/company-settings");
    return json.success && json.data != null;
  } catch (e) {
    if ((e as { status?: number })?.status === 404) return false;
    throw e;
  }
}

export async function createCompanySettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
  const json = await apiFetch<unknown>("/admin/company-settings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!json.success || json.data == null) throw new Error("Failed to create company settings");
  const next = normalizeCompanySettings(json.data);
  saveCached(next);
  return next;
}

export async function replaceCompanySettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
  const json = await apiFetch<unknown>("/admin/company-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!json.success || json.data == null) throw new Error("Failed to save company settings");
  const next = normalizeCompanySettings(json.data);
  saveCached(next);
  return next;
}

export async function patchCompanySettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
  const json = await apiFetch<unknown>("/admin/company-settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!json.success || json.data == null) throw new Error("Failed to save company settings");
  const next = normalizeCompanySettings(json.data);
  saveCached(next);
  return next;
}

export async function deleteCompanySettings(): Promise<void> {
  try {
    localStorage.removeItem(COMPANY_SETTINGS_KEY);
    try {
      window.dispatchEvent(new CustomEvent(COMPANY_SETTINGS_EVENT));
    } catch {}
  } catch {}
  await apiFetch("/admin/company-settings", { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Hook — reactive singleton for public components (nav / footer / about).
// ---------------------------------------------------------------------------

export function useCompanySettings(): CompanySettings {
  // NOTE: always start from defaults so the first client render matches SSR.
  // Reading localStorage in the initializer would render cached (admin-saved)
  // values during hydration while the server rendered defaults → hydration
  // mismatch (e.g. conditionally rendered profile photos). Cached/API values
  // are applied in the effect below, after hydration. Same pattern as
  // LanguageProvider in app/i18n.tsx.
  const [settings, setSettings] = useState<CompanySettings>({ ...DEFAULT_COMPANY_SETTINGS });
  useEffect(() => {
    let cancelled = false;
    // fetchCompanySettings() returns fresh API data on success and falls back
    // to the localStorage cache on failure, so cached values still apply —
    // just after hydration instead of during it.
    fetchCompanySettings().then((next) => {
      if (!cancelled) setSettings(next);
    });
    const onUpd = () => {
      try {
        setSettings(loadCached());
      } catch {}
    };
    window.addEventListener(COMPANY_SETTINGS_EVENT as never, onUpd);
    window.addEventListener("storage", onUpd);
    return () => {
      cancelled = true;
      window.removeEventListener(COMPANY_SETTINGS_EVENT as never, onUpd);
      window.removeEventListener("storage", onUpd);
    };
  }, []);
  return settings;
}
