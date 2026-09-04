"use client";
import { useEffect, useState } from "react";
import { SEED_ARTICLES, SEED_EDU, SEED_INNOVATION, SEED_JOBS, SEED_OFFICIAL_PARTNERS, SEED_PRODUCTS } from "./data";
import type { Article, Edu, Innovation, Job, OfficialPartner, Product, Inquiry } from "./data";
import { apiFetch, buildQuery } from "./api";

const KEYS = { products: "nf_products", articles: "nf_articles", edu: "nf_edu", innovation: "nf_innovation", jobs: "nf_jobs", inquiries: "nf_inquiries", officialPartners: "nf_official_partners" } as const;

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

// ---------------------------------------------------------------------------
// API helpers — best-effort fetch with fallback to localStorage / seed
// ---------------------------------------------------------------------------
async function fetchFromApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const json = await apiFetch<T>(path);
    if (json.success && json.data != null) return json.data as T;
    return fallback;
  } catch {
    return fallback;
  }
}

// Normalize product from API which may have different shape (e.g. isPublished, id fields)
function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return SEED_PRODUCTS;
  return raw.map((p: Record<string, unknown>) => ({
    slug: String(p.slug ?? p.id ?? ""),
    cat: (p.cat as Product["cat"]) ?? "choco",
    title: String(p.title ?? ""),
    note: String(p.note ?? ""),
    tag: String(p.tag ?? ""),
    img: String(p.img ?? p.image ?? ""),
    desc: String(p.desc ?? p.description ?? ""),
    type: (p.type as Product["type"]) ?? "general",
    isHighlight: Boolean(p.isHighlight ?? p.is_highlight ?? false),
  })).filter((p) => p.slug && p.title);
}

function normalizeArticles(raw: unknown): Article[] {
  if (!Array.isArray(raw)) return SEED_ARTICLES;
  return raw.map((a: Record<string, unknown>) => ({
    slug: String(a.slug ?? ""),
    title: String(a.title ?? ""),
    excerpt: String(a.excerpt ?? ""),
    content: String(a.content ?? a.contentEn ?? a.contentEN ?? ""),
    contentId: String(a.contentId ?? a.contentID ?? a.content ?? ""),
    contentEn: String(a.contentEn ?? a.contentEN ?? a.content ?? ""),
    contentZh: String(a.contentZh ?? a.contentZN ?? a.contentZh ?? a.content ?? ""),
    date: String(a.date ?? a.published_date ?? new Date().toISOString().slice(0, 10)),
    category: String(a.category ?? "General"),
    img: String(a.img ?? a.thumbnail ?? ""),
  })).filter((a) => a.slug && a.title);
}

function normalizeOfficialPartners(raw: unknown): OfficialPartner[] {
  if (!Array.isArray(raw)) return SEED_OFFICIAL_PARTNERS;
  return raw.map((p: Record<string, unknown>) => ({
    id: String(p.id ?? ""),
    name: String(p.name ?? ""),
    description: String(p.description ?? p.desc ?? ""),
    image: String(p.image ?? p.brandLogo ?? ""),
    background: String(p.background ?? p.mainImage ?? ""),
    isPublished: p.isPublished ?? p.is_published ?? true ? true : false,
  })).filter((p) => p.id && p.name);
}

export function useStore() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [edu, setEdu] = useState<Edu[]>(SEED_EDU);
  const [innovation, setInnovation] = useState<Innovation[]>(SEED_INNOVATION);
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [officialPartners, setOfficialPartners] = useState<OfficialPartner[]>(SEED_OFFICIAL_PARTNERS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Load local first for instant paint
    const localProducts = migrateProducts(load(KEYS.products, SEED_PRODUCTS));
    const localArticles = load(KEYS.articles, SEED_ARTICLES);
    const localEdu = load(KEYS.edu, SEED_EDU);
    const localInnovation = load(KEYS.innovation, SEED_INNOVATION);
    const localJobs = load(KEYS.jobs, SEED_JOBS);
    const localPartners = load(KEYS.officialPartners, SEED_OFFICIAL_PARTNERS);
    const localInquiries = load(KEYS.inquiries, [] as Inquiry[]);

    if (!cancelled) {
      setProducts(localProducts);
      setArticles(localArticles as Article[]);
      setEdu(localEdu as Edu[]);
      setInnovation(localInnovation as Innovation[]);
      setJobs(localJobs as Job[]);
      setOfficialPartners(localPartners as OfficialPartner[]);
      setInquiries(localInquiries as Inquiry[]);
    }

    // Then try API — overwrite if successful ( keeps localStorage as offline cache )
    (async () => {
      const [apiProducts, apiArticles, apiPartners, apiEdu, apiInnov, apiJobs] = await Promise.all([
        fetchFromApi<unknown>("/products?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/articles?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/official-partners?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/education?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/innovations?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/jobs?limit=50", null as unknown as unknown),
      ]);

      if (cancelled) return;

      if (apiProducts) {
        const norm = normalizeProducts(apiProducts);
        if (norm.length) setProducts(norm);
      }
      if (apiArticles) {
        const norm = normalizeArticles(apiArticles);
        if (norm.length) setArticles(norm as Article[]);
      }
      if (apiPartners) {
        const norm = normalizeOfficialPartners(apiPartners);
        if (norm.length) setOfficialPartners(norm as OfficialPartner[]);
      }
      if (apiEdu && Array.isArray(apiEdu) && apiEdu.length) setEdu(apiEdu as Edu[]);
      if (apiInnov && Array.isArray(apiInnov) && apiInnov.length) setInnovation(apiInnov as Innovation[]);
      if (apiJobs && Array.isArray(apiJobs) && apiJobs.length) setJobs(apiJobs as Job[]);

      // inquiries is admin-only — try but ignore if unauthorized
      try {
        const q = buildQuery({ page: 1, limit: 50, sort: "createdAt:desc" });
        const json = await apiFetch<Inquiry[]>(`/admin/inquiries${q}`);
        if (json.success && Array.isArray(json.data) && json.data.length) {
          // Map Inquiry shape: backend may use createdAt vs date
          const mapped: Inquiry[] = (json.data as unknown as Record<string, unknown>[]).map((x) => ({
            id: String(x.id ?? ""),
            name: String(x.name ?? ""),
            city: String(x.city ?? ""),
            whatsapp: String(x.whatsapp ?? ""),
            interest: String(x.interest ?? ""),
            date: String((x.date as string) ?? (x.createdAt as string) ?? new Date().toISOString()),
          }));
          if (mapped.length) setInquiries(mapped);
        }
      } catch {}

      if (!cancelled) {
        setApiReady(true);
        setReady(true);
      }
    })();

    // If API never responds, still mark ready after timeout
    const t = setTimeout(() => {
      if (!cancelled) setReady((v) => (v ? v : true));
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => { if (ready) save(KEYS.products, products); }, [products, ready]);
  useEffect(() => { if (ready) save(KEYS.articles, articles); }, [articles, ready]);
  useEffect(() => { if (ready) save(KEYS.edu, edu); }, [edu, ready]);
  useEffect(() => { if (ready) save(KEYS.innovation, innovation); }, [innovation, ready]);
  useEffect(() => { if (ready) save(KEYS.jobs, jobs); }, [jobs, ready]);
  useEffect(() => { if (ready) save(KEYS.officialPartners, officialPartners); }, [officialPartners, ready]);
  useEffect(() => { if (ready) save(KEYS.inquiries, inquiries); }, [inquiries, ready]);

  const reset = () => {
    setProducts(SEED_PRODUCTS); setArticles(SEED_ARTICLES); setEdu(SEED_EDU); setInnovation(SEED_INNOVATION); setJobs(SEED_JOBS); setOfficialPartners(SEED_OFFICIAL_PARTNERS);
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  };
  return { ready, apiReady, products, setProducts, articles, setArticles, edu, setEdu, innovation, setInnovation, jobs, setJobs, officialPartners, setOfficialPartners, inquiries, setInquiries, reset };
}

// for non-hook access (articles list / detail fallback to seed)
export function getSeedArticles(): Article[] {
  try {
    const v = localStorage.getItem(KEYS.articles);
    if (v) {
      const parsed = JSON.parse(v) as Article[];
      // migrate old single-content articles → fill locale variants
      return parsed.map((a) => ({
        ...a,
        contentId: a.contentId ?? a.content ?? "",
        contentEn: a.contentEn ?? a.content ?? "",
        contentZh: a.contentZh ?? a.content ?? "",
      }));
    }
  } catch {}
  return SEED_ARTICLES;
}
export function getArticleContent(a: Article, locale: string): string {
  if (locale === "id") return a.contentId ?? a.contentEn ?? a.content ?? "";
  if (locale === "zh") return a.contentZh ?? a.contentEn ?? a.content ?? "";
  return a.contentEn ?? a.content ?? "";
}
function migrateProducts(list: Product[]): Product[] {
  return list.map((p) => ({
    ...p,
    type: (p.type as Product["type"]) ?? "general",
    isHighlight: p.isHighlight ?? false,
  }));
}
export function getSeedProducts(): Product[] {
  try {
    const v = localStorage.getItem(KEYS.products);
    if (v) return migrateProducts(JSON.parse(v) as Product[]);
  } catch {}
  return SEED_PRODUCTS;
}
export function getHighlightedProducts(): Product[] {
  return getSeedProducts().filter((p) => p.isHighlight);
}
export function getProductsByType(type: Product["type"]): Product[] {
  return getSeedProducts().filter((p) => (p.type ?? "general") === type);
}
export function getSeedOfficialPartners(): OfficialPartner[] {
  try { const v = localStorage.getItem(KEYS.officialPartners); if (v) return JSON.parse(v) as OfficialPartner[]; } catch {}
  return SEED_OFFICIAL_PARTNERS;
}
export function getPublishedOfficialPartners(): OfficialPartner[] {
  return getSeedOfficialPartners().filter((p) => p.isPublished);
}

// ---------------------------------------------------------------------------
// API CRUD helpers for admin pages (used when API available, else caller falls back to setProducts local)
// ---------------------------------------------------------------------------
export async function apiCreateProduct(payload: Product): Promise<Product> {
  const json = await apiFetch<Product>("/admin/products", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateProduct(slug: string, payload: Partial<Product>): Promise<Product> {
  const json = await apiFetch<Product>(`/admin/products/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiDeleteProduct(slug: string): Promise<void> {
  const json = await apiFetch(`/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}
export async function apiToggleHighlight(slug: string, isHighlight: boolean): Promise<void> {
  const json = await apiFetch(`/admin/products/${encodeURIComponent(slug)}/highlight`, { method: "PATCH", body: JSON.stringify({ isHighlight }) });
  if (!json.success) throw new Error(json.error?.message || "Highlight failed");
}
