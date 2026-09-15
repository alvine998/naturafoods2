"use client";
import { useEffect, useState } from "react";
import { SEED_ARTICLES, SEED_EDU, SEED_HOMEBRANDS, SEED_INNOVATION, SEED_JOBS, SEED_OFFICIAL_PARTNERS, SEED_PRODUCT_CATEGORIES, SEED_PRODUCTS, SEED_SOCIAL_MEDIA } from "./data";
import type { Article, Edu, HomeBrand, Innovation, Job, OfficialPartner, Product, ProductCategory, Inquiry, SalesContact, SocialMedia } from "./data";
import { apiFetch, buildQuery } from "./api";

const KEYS = { products: "nf_products", articles: "nf_articles", edu: "nf_edu", innovation: "nf_innovation", jobs: "nf_jobs", inquiries: "nf_inquiries", officialPartners: "nf_official_partners", salesContacts: "nf_sales_contacts", homeBrands: "nf_home_brands", productCategories: "nf_product_categories", socialMedia: "nf_social_media" } as const;

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
// localStorage is a paint-first cache, not the source of truth. Writing tens of MB
// (articles with inlined base64 images) throws QuotaExceededError, which swallowed
// silently left a stale cache behind — skip oversized payloads instead.
const MAX_CACHED_BYTES = 3_000_000;

function save(key: string, v: unknown) {
  try {
    const raw = JSON.stringify(v);
    if (raw.length > MAX_CACHED_BYTES) return;
    localStorage.setItem(key, raw);
  } catch {}
}

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
  return raw.map((p: Record<string, unknown>) => {
    const catObj = p.category as Record<string, unknown> | undefined;
    const catSlug = String(catObj?.slug ?? p.cat ?? "choco");
    const catId = String(p.categoryId ?? catObj?.id ?? "");
    return {
      slug: String(p.slug ?? p.id ?? ""),
      cat: catSlug,
      categoryId: catId || undefined,
      category: catObj ? { id: String(catObj.id ?? ""), slug: String(catObj.slug ?? catSlug), name: String(catObj.name ?? catSlug), description: String(catObj.description ?? ""), isActive: Boolean(catObj.isActive ?? true) } : undefined,
      title: String(p.title ?? ""),
      note: String(p.note ?? ""),
      tag: String(p.tag ?? ""),
      img: String(p.img ?? p.image ?? ""),
      desc: String(p.desc ?? p.description ?? ""),
      type: (p.type as Product["type"]) ?? "general",
      isHighlight: Boolean(p.isHighlight ?? p.is_highlight ?? false),
    };
  }).filter((p) => p.slug && p.title);
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

function parseOrder(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

export function normalizeSalesContacts(raw: unknown): SalesContact[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c: Record<string, unknown>) => {
    const published = (c.published ?? c.isPublished ?? (c as Record<string, unknown>).is_published ?? c.is_active ?? (c as Record<string, unknown>).isActive ?? true) ? true : false;
    return {
      id: String(c.id ?? c.slug ?? ""),
      name: String(c.name ?? ""),
      gender: String(c.gender ?? ""),
      position: String(c.position ?? c.role ?? ""),
      whatsapp: String(c.whatsapp ?? c.phone ?? ""),
      email: String(c.email ?? ""),
      photo: String(c.photo ?? c.image ?? c.avatar ?? ""),
      location: String(c.location ?? c.city ?? ""),
      published,
      isPublished: published,
    };
  }).filter((c) => c.id && c.name);
}

export function normalizeSocialMedia(raw: unknown): SocialMedia[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s: Record<string, unknown>) => ({
    id: String(s.id ?? s.slug ?? ""),
    name: String(s.name ?? ""),
    description: String(s.description ?? s.desc ?? ""),
    image: String(s.image ?? s.logo ?? s.img ?? ""),
    instagram: String(s.instagram ?? ""),
    facebook: String(s.facebook ?? ""),
    tiktok: String(s.tiktok ?? ""),
    createdAt: s.createdAt as string | undefined,
    updatedAt: s.updatedAt as string | undefined,
  })).filter((s) => s.id && s.name);
}

// Dummy social media rows (seeded from the old hardcoded /social-media page) were
// removed — drop any cached copies still sitting in browsers' localStorage.
const REMOVED_DUMMY_SOCIAL_IDS = new Set([
  "barry-callebaut",
  "bensdorp",
  "avante",
  "dc6701b8-5ca2-4325-9154-c4479bdcb4b4",
  "94073507-d464-48d1-b21a-7143b2ab3158",
  "e8189d4c-76ae-42db-a7c7-6ba7293f4849",
]);

function migrateSocialMedia(raw: unknown): SocialMedia[] {
  return normalizeSocialMedia(raw).filter((m) => !REMOVED_DUMMY_SOCIAL_IDS.has(m.id));
}

function normalizeHomeBrands(raw: unknown): HomeBrand[] {
  if (!Array.isArray(raw)) return SEED_HOMEBRANDS;
  return raw.map((h: Record<string, unknown>) => ({
    id: String(h.id ?? ""),
    name: String(h.name ?? ""),
    image: String(h.image ?? h.img ?? ""),
    desc: String(h.desc ?? h.description ?? ""),
    createdAt: h.createdAt as string | undefined,
    updatedAt: h.updatedAt as string | undefined,
  })).filter((h) => h.id && h.name);
}

// Legacy dummy contacts removed from SEED_SALES_CONTACTS — drop any cached
// copies still sitting in browsers' localStorage so they don't resurface.
const REMOVED_DUMMY_SALES_IDS = new Set(["andi-wijaya", "sinta-putri"]);

function migrateSalesContacts(list: SalesContact[]): SalesContact[] {
  return (Array.isArray(list) ? list : []).map((c) => {
    const raw = c as unknown as Record<string, unknown>;
    const published = (c.published ?? raw.isPublished ?? raw.is_published ?? raw.isActive ?? true) ? true : false;
    return {
      id: String(c.id ?? ""),
      name: String(c.name ?? ""),
      gender: String(c.gender ?? ""),
      position: String(c.position ?? raw.role ?? ""),
      whatsapp: String(c.whatsapp ?? raw.phone ?? ""),
      email: String(c.email ?? ""),
      photo: String(c.photo ?? raw.image ?? raw.avatar ?? ""),
      location: String(c.location ?? raw.city ?? ""),
      published,
      isPublished: published,
    } as SalesContact;
  }).filter((c) => c.id && c.name && !REMOVED_DUMMY_SALES_IDS.has(c.id));
}

function normalizeOfficialPartners(raw: unknown): OfficialPartner[] {  if (!Array.isArray(raw)) return SEED_OFFICIAL_PARTNERS;
  return raw.map((p: Record<string, unknown>, idx: number) => {
    // Semantics: background = single right-side visual, images[] = bottom-bar logos (more than one)
    const rawImages = p.images ?? (p as Record<string, unknown>).logos ?? null;
    let images: string[] | undefined;
    if (Array.isArray(rawImages)) images = rawImages.map((v) => String(v ?? "")).filter(Boolean);
    else if (typeof rawImages === "string" && rawImages) images = [rawImages];
    const image = String((p.image as unknown) ?? (Array.isArray(p.image) ? (p.image as unknown[])[0] : "") ?? p.brandLogo ?? images?.[0] ?? "");
    const background = String(p.background ?? p.mainImage ?? "");
    const rawColor = typeof p.color === "string" ? p.color.trim() : "";
    const order = parseOrder(p.order ?? (p as Record<string, unknown>).sortOrder) ?? idx;
    return {
      id: String(p.id ?? ""),
      name: String(p.name ?? ""),
      description: String(p.description ?? p.desc ?? ""),
      image,
      background,
      ...(images && images.length ? { images } : {}),
      ...(rawColor ? { color: rawColor } : {}),
      order,
      isPublished: p.isPublished ?? p.is_published ?? true ? true : false,
    };
  }).filter((p) => p.id && p.name);
}

function isValidHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim());
}

function parseStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) {
    const out = (v as unknown[]).map((x) => String(x ?? "")).filter(Boolean);
    return out.length ? out : undefined;
  }
  return undefined;
}

function migrateOfficialPartners(list: OfficialPartner[]): OfficialPartner[] {
  return (Array.isArray(list) ? list : []).map((p, idx) => {
    const raw = p as unknown as Record<string, unknown>;
    // merge legacy logos[] into images[] (bottom logos), deduped
    const fromImages = parseStringArray(p.images);
    const fromLogos = parseStringArray(raw.logos);
    const merged = [...(fromImages ?? []), ...(fromLogos ?? [])].filter((v, i, a) => v && a.indexOf(v) === i);
    const images = merged.length ? merged : undefined;
    const image = String(p.image ?? images?.[0] ?? "");
    const { logos: _drop, ...rest } = raw as Record<string, unknown> & { logos?: unknown };
    void _drop;
    return { ...rest, id: String(p.id ?? ""), name: String(p.name ?? ""), description: String(p.description ?? ""), image, background: String(p.background ?? ""), ...(images ? { images } : {}), ...(isValidHexColor(p.color) ? { color: (p.color as string).trim() } : {}), order: parseOrder(p.order) ?? idx } as OfficialPartner;
  });
}

export function sortOfficialPartners<T extends { order?: number; name?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function useStore() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [edu, setEdu] = useState<Edu[]>(SEED_EDU);
  const [innovation, setInnovation] = useState<Innovation[]>(SEED_INNOVATION);
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [officialPartners, setOfficialPartners] = useState<OfficialPartner[]>(SEED_OFFICIAL_PARTNERS);
  const [salesContacts, setSalesContacts] = useState<SalesContact[]>([]);
  const [homeBrands, setHomeBrands] = useState<HomeBrand[]>(SEED_HOMEBRANDS);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(SEED_PRODUCT_CATEGORIES);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>(SEED_SOCIAL_MEDIA);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Load local first for instant paint (articles skipped — API is source of truth)
    const localProducts = migrateProducts(load(KEYS.products, SEED_PRODUCTS));
    const localArticles = SEED_ARTICLES;
    const localEdu = load(KEYS.edu, SEED_EDU);
    const localInnovation = load(KEYS.innovation, SEED_INNOVATION);
    const localJobs = load(KEYS.jobs, SEED_JOBS);
    const localPartners = migrateOfficialPartners(load(KEYS.officialPartners, SEED_OFFICIAL_PARTNERS));
    const localSalesContacts = migrateSalesContacts(load(KEYS.salesContacts, [] as SalesContact[]));
    const localHomeBrands = load(KEYS.homeBrands, SEED_HOMEBRANDS);
    const localProductCategories = load(KEYS.productCategories, SEED_PRODUCT_CATEGORIES);
    const localSocialMedia = migrateSocialMedia(load(KEYS.socialMedia, SEED_SOCIAL_MEDIA));
    const localInquiries = load(KEYS.inquiries, [] as Inquiry[]);

    if (!cancelled) {
      setProducts(localProducts);
      setArticles(localArticles as Article[]);
      setEdu(localEdu as Edu[]);
      setInnovation(localInnovation as Innovation[]);
      setJobs(localJobs as Job[]);
      setOfficialPartners(localPartners as OfficialPartner[]);
      setSalesContacts(localSalesContacts as SalesContact[]);
      setHomeBrands(localHomeBrands as HomeBrand[]);
      setProductCategories(localProductCategories as ProductCategory[]);
      if (localSocialMedia.length) setSocialMedia(localSocialMedia);
      setInquiries(localInquiries as Inquiry[]);
    }

    // Then try API — overwrite if successful ( keeps localStorage as offline cache )
    // Sales lives at GET /sales (backend src/routes/sales.js); keep legacy
    // /sales-contacts as fallback for older backends.
    const fetchSalesList = async (): Promise<unknown> => {
      try {
        const json = await apiFetch<unknown>("/sales?limit=50");
        if (json.success && json.data != null) return json.data as unknown;
      } catch {}
      try {
        const json = await apiFetch<unknown>("/sales-contacts?limit=50");
        if (json.success && json.data != null) return json.data as unknown;
      } catch {}
      return null as unknown as unknown;
    };
    (async () => {
      const [apiProducts, apiArticles, apiPartners, apiEdu, apiInnov, apiJobs, apiSales, apiHomeBrands, apiProductCategories, apiSocialMedia] = await Promise.all([
        fetchFromApi<unknown>("/products?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/articles?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/official-partners?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/education?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/innovations?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/jobs?limit=50", null as unknown as unknown),
        fetchSalesList(),
        fetchFromApi<unknown>("/home-brands?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/categories?limit=50", null as unknown as unknown),
        fetchFromApi<unknown>("/social-media?limit=50", null as unknown as unknown),
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
      if (apiHomeBrands && Array.isArray(apiHomeBrands) && apiHomeBrands.length) {
        const norm = normalizeHomeBrands(apiHomeBrands);
        if (norm.length) setHomeBrands(norm);
      }
      if (apiProductCategories && Array.isArray(apiProductCategories) && apiProductCategories.length) {
        const norm = apiProductCategories.map((c: Record<string, unknown>) => ({
          id: String(c.id ?? ""),
          slug: String(c.slug ?? c.id ?? ""),
          name: String(c.name ?? ""),
          description: String(c.description ?? c.desc ?? ""),
          isActive: c.isActive !== false && c.is_active !== false,
          isHighlight: Boolean(c.isHighlight ?? c.is_highlight ?? false),
        })).filter((c: ProductCategory) => c.id && c.name);
        if (norm.length) setProductCategories(norm);
      }
      if (apiSales && Array.isArray(apiSales) && apiSales.length) {
        const norm = normalizeSalesContacts(apiSales);
        if (norm.length) setSalesContacts(norm);
      }
      if (apiSocialMedia && Array.isArray(apiSocialMedia) && apiSocialMedia.length) {
        const norm = normalizeSocialMedia(apiSocialMedia);
        if (norm.length) setSocialMedia(norm);
      }

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
  useEffect(() => { if (ready) save(KEYS.salesContacts, salesContacts); }, [salesContacts, ready]);
  useEffect(() => { if (ready) save(KEYS.homeBrands, homeBrands); }, [homeBrands, ready]);
  useEffect(() => { if (ready) save(KEYS.productCategories, productCategories); }, [productCategories, ready]);
  useEffect(() => { if (ready) save(KEYS.socialMedia, socialMedia); }, [socialMedia, ready]);
  useEffect(() => { if (ready) save(KEYS.inquiries, inquiries); }, [inquiries, ready]);

  const reset = () => {
    setProducts(SEED_PRODUCTS); setArticles(SEED_ARTICLES); setEdu(SEED_EDU); setInnovation(SEED_INNOVATION); setJobs(SEED_JOBS); setOfficialPartners(SEED_OFFICIAL_PARTNERS); setSalesContacts([]); setHomeBrands(SEED_HOMEBRANDS); setProductCategories(SEED_PRODUCT_CATEGORIES); setSocialMedia(SEED_SOCIAL_MEDIA);
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  };
  return { ready, apiReady, products, setProducts, articles, setArticles, edu, setEdu, innovation, setInnovation, jobs, setJobs, officialPartners, setOfficialPartners, salesContacts, setSalesContacts, homeBrands, setHomeBrands, productCategories, setProductCategories, inquiries, setInquiries, socialMedia, setSocialMedia, reset };
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
function isPublishedArticle(raw: Record<string, unknown>): boolean {
  if (raw.isPublished === false || raw.is_published === false) return false;
  const status = typeof raw.status === "string" ? raw.status.toLowerCase() : "";
  return status !== "draft" && status !== "unpublished" && status !== "archived" && status !== "private";
}

function sortArticlesByDateDesc(list: Article[]): Article[] {
  return [...list].sort((a, b) => {
    const ta = Date.parse(a.date ?? "");
    const tb = Date.parse(b.date ?? "");
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });
}

// Public articles list (GET /articles) — returns null so callers fall back to local cache / seed
export async function fetchPublicArticles(limit = 50): Promise<Article[] | null> {
  try {
    const json = await apiFetch<unknown>(`/articles${buildQuery({ page: 1, limit, sort: "date:desc" })}`);
    if (!json.success || !Array.isArray(json.data)) return null;
    const list = normalizeArticles((json.data as Record<string, unknown>[]).filter(isPublishedArticle));
    return list.length ? sortArticlesByDateDesc(list) : null;
  } catch {
    return null;
  }
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
  try { const v = localStorage.getItem(KEYS.officialPartners); if (v) return migrateOfficialPartners(JSON.parse(v) as OfficialPartner[]); } catch {}
  return SEED_OFFICIAL_PARTNERS;
}export function getPublishedOfficialPartners(): OfficialPartner[] {
  return getSeedOfficialPartners().filter((p) => p.isPublished);
}

export function sortSalesContacts<T extends { name?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
}
export function getSeedSalesContacts(): SalesContact[] {
  try {
    const v = localStorage.getItem(KEYS.salesContacts);
    if (v) {
      const parsed = JSON.parse(v) as SalesContact[];
      if (Array.isArray(parsed) && parsed.length) return migrateSalesContacts(parsed);
    }
  } catch {}
  return [] as SalesContact[];
}
export function getActiveSalesContacts(): SalesContact[] {
  return sortSalesContacts(getSeedSalesContacts().filter((c) => c.published !== false && c.name));
}
export function salesInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "NF";
}

// Public social media list (GET /social-media) — null so callers fall back to local cache / seed
export async function fetchPublicSocialMedia(limit = 50): Promise<SocialMedia[] | null> {
  try {
    const json = await apiFetch<unknown>(`/social-media${buildQuery({ page: 1, limit })}`);
    if (!json.success || !Array.isArray(json.data)) return null;
    const list = normalizeSocialMedia(json.data);
    return list.length ? list : null;
  } catch {
    return null;
  }
}
export function getSeedSocialMedia(): SocialMedia[] {
  try {
    const v = localStorage.getItem(KEYS.socialMedia);
    if (v) {
      const list = migrateSocialMedia(JSON.parse(v));
      if (list.length) return list;
    }
  } catch {}
  return SEED_SOCIAL_MEDIA;
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

// ---------------------------------------------------------------------------
// HomeBrand CRUD helpers
// ---------------------------------------------------------------------------
export async function apiCreateHomeBrand(payload: HomeBrand): Promise<HomeBrand> {
  const json = await apiFetch<HomeBrand>("/admin/home-brands", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateHomeBrand(id: string, payload: Partial<HomeBrand>): Promise<HomeBrand> {
  const json = await apiFetch<HomeBrand>(`/admin/home-brands/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiDeleteHomeBrand(id: string): Promise<void> {
  const json = await apiFetch(`/admin/home-brands/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}

// ---------------------------------------------------------------------------
// ProductCategory CRUD helpers
// ---------------------------------------------------------------------------
export async function apiCreateProductCategory(payload: Partial<ProductCategory>): Promise<ProductCategory> {
  const json = await apiFetch<ProductCategory>("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Create failed");
  return json.data;
}
export async function apiUpdateProductCategory(slug: string, payload: Partial<ProductCategory>): Promise<ProductCategory> {
  const json = await apiFetch<ProductCategory>(`/admin/categories/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(payload) });
  if (!json.success) throw new Error(json.error?.message || "Update failed");
  return json.data;
}
export async function apiToggleCategoryActive(slug: string, isActive: boolean): Promise<void> {
  const json = await apiFetch(`/admin/categories/${encodeURIComponent(slug)}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) });
  if (!json.success) throw new Error(json.error?.message || "Toggle failed");
}
export async function apiDeleteProductCategory(slug: string): Promise<void> {
  const json = await apiFetch(`/admin/categories/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!json.success) throw new Error(json.error?.message || "Delete failed");
}
