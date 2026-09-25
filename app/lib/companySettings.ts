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
  const [settings, setSettings] = useState<CompanySettings>(() => {
    if (typeof window === "undefined") return { ...DEFAULT_COMPANY_SETTINGS };
    return loadCached();
  });
  useEffect(() => {
    let cancelled = false;
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
